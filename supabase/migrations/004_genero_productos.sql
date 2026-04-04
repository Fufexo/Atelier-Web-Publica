-- Agrega columna genero a productos
-- hombre | mujer | unisex (default para productos que aplican a ambos)

alter table public.productos
  add column genero text not null default 'unisex'
  check (genero in ('hombre', 'mujer', 'unisex'));

create index idx_productos_genero on public.productos(genero);
