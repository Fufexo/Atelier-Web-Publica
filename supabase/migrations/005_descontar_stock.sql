-- ============================================================
-- descontar_stock
-- Esta función existía en producción pero no en el repositorio. Se documenta aquí
-- tal cual estaba, para que la base se pueda reconstruir desde las migraciones.
-- 006 la endurece; la app ya no la usa (ver registrar_pedido_pagado).
-- ============================================================
create or replace function public.descontar_stock(p_variante_id uuid, p_cantidad integer)
returns void
language plpgsql
as $$
begin
  update variantes
  set stock = stock - p_cantidad
  where id = p_variante_id and stock >= p_cantidad;

  if not found then
    raise exception 'Stock insuficiente para la variante %', p_variante_id;
  end if;
end;
$$;
