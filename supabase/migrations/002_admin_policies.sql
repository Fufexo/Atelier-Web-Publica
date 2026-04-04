-- ============================================================
-- POLÍTICAS PARA ADMIN
-- Solo usuarios autenticados (tú y tu tía) pueden escribir
-- ============================================================

-- Productos: admin puede insertar, actualizar, eliminar
create policy "admin_productos_insert" on public.productos
  for insert with check (auth.uid() is not null);

create policy "admin_productos_update" on public.productos
  for update using (auth.uid() is not null);

create policy "admin_productos_delete" on public.productos
  for delete using (auth.uid() is not null);

-- Categorias
create policy "admin_categorias_insert" on public.categorias
  for insert with check (auth.uid() is not null);

create policy "admin_categorias_update" on public.categorias
  for update using (auth.uid() is not null);

create policy "admin_categorias_delete" on public.categorias
  for delete using (auth.uid() is not null);

-- Variantes
create policy "admin_variantes_insert" on public.variantes
  for insert with check (auth.uid() is not null);

create policy "admin_variantes_update" on public.variantes
  for update using (auth.uid() is not null);

create policy "admin_variantes_delete" on public.variantes
  for delete using (auth.uid() is not null);

-- Admin ve TODOS los pedidos (no solo los suyos)
create policy "admin_pedidos_read" on public.pedidos
  for select using (auth.uid() is not null);

create policy "admin_pedidos_update" on public.pedidos
  for update using (auth.uid() is not null);

-- Admin ve todos los items y pagos
create policy "admin_items_read" on public.items_pedido
  for select using (auth.uid() is not null);

create policy "admin_pagos_read" on public.pagos
  for select using (auth.uid() is not null);

-- ============================================================
-- STORAGE: bucket para imágenes de productos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

create policy "imagenes_publicas" on storage.objects
  for select using (bucket_id = 'productos');

create policy "admin_subir_imagen" on storage.objects
  for insert with check (bucket_id = 'productos' and auth.uid() is not null);

create policy "admin_actualizar_imagen" on storage.objects
  for update using (bucket_id = 'productos' and auth.uid() is not null);

create policy "admin_eliminar_imagen" on storage.objects
  for delete using (bucket_id = 'productos' and auth.uid() is not null);
