-- ============================================================
-- 009 — Orden explícito de variantes
--
-- Sin ORDER BY, Postgres devuelve las filas en el orden físico, que cambia cada vez
-- que una fila se actualiza (p. ej. al descontar stock en una venta). Como la ficha
-- asigna las fotos a los colores por orden de aparición ("imagen 1 = primer color"),
-- una venta podía hacer que un color mostrara la foto de otro, y el editor del panel
-- reordenaba las filas. Ahora el panel guarda la posición de cada variante.
-- ============================================================

alter table public.variantes
  add column if not exists orden smallint not null default 0;

-- Variantes existentes: fijar el orden en que se muestran hoy (el físico, `ctid`), así
-- ningún color cambia de foto al aplicar esta migración.
update public.variantes v
set orden = o.posicion
from (
  select id, (row_number() over (partition by producto_id order by ctid) - 1)::smallint as posicion
  from public.variantes
) o
where o.id = v.id;
