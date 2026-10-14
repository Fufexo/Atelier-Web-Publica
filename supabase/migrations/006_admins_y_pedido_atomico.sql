-- ============================================================
-- 006 — Administradores explícitos, políticas corregidas y pedido atómico
--
-- Antes, toda política de escritura era `auth.uid() is not null`: cualquier persona
-- que se registrara en Supabase Auth con la anon key (que es pública) podía editar
-- productos y leer todos los pedidos con datos personales. Ahora el acceso depende
-- de estar en `public.admins`.
--
-- Es compatible con la versión anterior de la app: se puede aplicar antes de
-- desplegar el código nuevo.
-- ============================================================

-- ── Administradores ─────────────────────────────────────────
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Cada admin puede verse a sí mismo. Altas y bajas: desde el SQL Editor.
drop policy if exists "admins_lectura_propia" on public.admins;
create policy "admins_lectura_propia" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

-- Los usuarios que ya existían eran los administradores de la tienda.
insert into public.admins (user_id)
select id from auth.users
on conflict do nothing;

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke execute on function public.es_admin() from public, anon;
grant execute on function public.es_admin() to authenticated;

-- ── Políticas del panel ─────────────────────────────────────
-- `(select public.es_admin())` se evalúa una vez por consulta, no por fila.
-- Las políticas *_select dejan al admin ver productos, categorías y variantes
-- inactivos (antes desaparecían del panel al desactivarlos).

-- Productos
drop policy if exists "admin_productos_select" on public.productos;
drop policy if exists "admin_productos_insert" on public.productos;
drop policy if exists "admin_productos_update" on public.productos;
drop policy if exists "admin_productos_delete" on public.productos;
create policy "admin_productos_select" on public.productos
  for select to authenticated using ((select public.es_admin()));
create policy "admin_productos_insert" on public.productos
  for insert to authenticated with check ((select public.es_admin()));
create policy "admin_productos_update" on public.productos
  for update to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));
create policy "admin_productos_delete" on public.productos
  for delete to authenticated using ((select public.es_admin()));

-- Categorías
drop policy if exists "admin_categorias_select" on public.categorias;
drop policy if exists "admin_categorias_insert" on public.categorias;
drop policy if exists "admin_categorias_update" on public.categorias;
drop policy if exists "admin_categorias_delete" on public.categorias;
create policy "admin_categorias_select" on public.categorias
  for select to authenticated using ((select public.es_admin()));
create policy "admin_categorias_insert" on public.categorias
  for insert to authenticated with check ((select public.es_admin()));
create policy "admin_categorias_update" on public.categorias
  for update to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));
create policy "admin_categorias_delete" on public.categorias
  for delete to authenticated using ((select public.es_admin()));

-- Variantes
drop policy if exists "admin_variantes_select" on public.variantes;
drop policy if exists "admin_variantes_insert" on public.variantes;
drop policy if exists "admin_variantes_update" on public.variantes;
drop policy if exists "admin_variantes_delete" on public.variantes;
create policy "admin_variantes_select" on public.variantes
  for select to authenticated using ((select public.es_admin()));
create policy "admin_variantes_insert" on public.variantes
  for insert to authenticated with check ((select public.es_admin()));
create policy "admin_variantes_update" on public.variantes
  for update to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));
create policy "admin_variantes_delete" on public.variantes
  for delete to authenticated using ((select public.es_admin()));

-- Pedidos, ítems y pagos (datos personales: solo admins)
drop policy if exists "admin_pedidos_read" on public.pedidos;
drop policy if exists "admin_pedidos_update" on public.pedidos;
create policy "admin_pedidos_read" on public.pedidos
  for select to authenticated using ((select public.es_admin()));
create policy "admin_pedidos_update" on public.pedidos
  for update to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));

drop policy if exists "admin_items_read" on public.items_pedido;
create policy "admin_items_read" on public.items_pedido
  for select to authenticated using ((select public.es_admin()));

drop policy if exists "admin_pagos_read" on public.pagos;
create policy "admin_pagos_read" on public.pagos
  for select to authenticated using ((select public.es_admin()));

-- ── Storage ─────────────────────────────────────────────────
-- El bucket `categorias` no tenía políticas: subir una portada fallaba en silencio.
insert into storage.buckets (id, name, public)
values ('categorias', 'categorias', true)
on conflict (id) do nothing;

drop policy if exists "imagenes_publicas" on storage.objects;
drop policy if exists "admin_subir_imagen" on storage.objects;
drop policy if exists "admin_actualizar_imagen" on storage.objects;
drop policy if exists "admin_eliminar_imagen" on storage.objects;

create policy "imagenes_publicas" on storage.objects
  for select using (bucket_id in ('productos', 'categorias'));
create policy "admin_subir_imagen" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('productos', 'categorias') and (select public.es_admin()));
create policy "admin_actualizar_imagen" on storage.objects
  for update to authenticated
  using (bucket_id in ('productos', 'categorias') and (select public.es_admin()));
create policy "admin_eliminar_imagen" on storage.objects
  for delete to authenticated
  using (bucket_id in ('productos', 'categorias') and (select public.es_admin()));

-- ── Pedido atómico ──────────────────────────────────────────
-- Inserta pedido, ítems y pago y descuenta stock en una sola transacción: o queda
-- todo registrado o nada. Si falta stock lanza un error y la API reembolsa el cargo.
create or replace function public.registrar_pedido_pagado(
  p_pedido jsonb,
  p_items  jsonb,
  p_pago   jsonb
)
returns table (id uuid, numero integer)
language plpgsql
set search_path = ''
as $$
declare
  v_pedido_id uuid;
  v_numero    integer;
  v_item      record;
begin
  insert into public.pedidos (
    estado, nombre_comprador, email_comprador, telefono_comprador, direccion_envio,
    subtotal, igv, costo_envio, total
  ) values (
    'pagado',
    p_pedido->>'nombre_comprador',
    p_pedido->>'email_comprador',
    p_pedido->>'telefono_comprador',
    p_pedido->'direccion_envio',
    (p_pedido->>'subtotal')::numeric,
    (p_pedido->>'igv')::numeric,
    (p_pedido->>'costo_envio')::numeric,
    (p_pedido->>'total')::numeric
  )
  returning pedidos.id, pedidos.numero into v_pedido_id, v_numero;

  for v_item in
    select * from jsonb_to_recordset(p_items) as x(
      variante_id uuid, producto_id uuid, nombre_producto text, talla text, color text,
      precio_unitario numeric, cantidad integer
    )
  loop
    update public.variantes v
       set stock = v.stock - v_item.cantidad
     where v.id = v_item.variante_id and v.stock >= v_item.cantidad;
    if not found then
      raise exception 'Stock insuficiente para la variante %', v_item.variante_id;
    end if;

    insert into public.items_pedido (
      pedido_id, producto_id, variante_id, nombre_producto, talla, color, precio_unitario, cantidad
    ) values (
      v_pedido_id, v_item.producto_id, v_item.variante_id, v_item.nombre_producto,
      v_item.talla, v_item.color, v_item.precio_unitario, v_item.cantidad
    );
  end loop;

  insert into public.pagos (
    pedido_id, estado, metodo, culqi_charge_id, culqi_token_id, monto, moneda,
    ultimos_4_digitos, marca_tarjeta, respuesta_culqi
  ) values (
    v_pedido_id, 'completado', 'tarjeta',
    p_pago->>'culqi_charge_id',
    p_pago->>'culqi_token_id',
    (p_pago->>'monto')::numeric,
    'PEN',
    p_pago->>'ultimos_4_digitos',
    p_pago->>'marca_tarjeta',
    p_pago->'respuesta_culqi'
  );

  return query select v_pedido_id, v_numero;
end;
$$;

-- Solo el servidor (service role) registra pedidos.
revoke execute on function public.registrar_pedido_pagado(jsonb, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.registrar_pedido_pagado(jsonb, jsonb, jsonb) to service_role;

-- ── Endurecimiento ──────────────────────────────────────────
-- Avisos del linter de seguridad de Supabase (search_path mutable).
alter function public.set_updated_at() set search_path = '';
alter function public.descontar_stock(uuid, integer) set search_path = public;
revoke execute on function public.descontar_stock(uuid, integer) from public, anon, authenticated;

-- Llaves foráneas sin índice.
create index if not exists idx_items_pedido_producto on public.items_pedido(producto_id);
create index if not exists idx_items_pedido_variante on public.items_pedido(variante_id);
