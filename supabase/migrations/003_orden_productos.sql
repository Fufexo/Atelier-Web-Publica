alter table public.productos add column if not exists orden integer not null default 0;
create index if not exists idx_productos_orden on public.productos(orden);
