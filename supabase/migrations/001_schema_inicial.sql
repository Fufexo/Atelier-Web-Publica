-- ============================================================
-- TIENDA DE ROPA - Esquema inicial
-- Supabase + Culqi (Perú)
-- ============================================================

-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- para búsqueda de texto

-- ============================================================
-- USUARIOS
-- Extiende auth.users de Supabase
-- ============================================================
create table public.perfiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  nombre        text not null,
  apellidos     text,
  telefono      text,
  dni           text,                    -- documento de identidad (Perú)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- DIRECCIONES DE ENVÍO
-- División política de Perú: departamento > provincia > distrito
-- ============================================================
create table public.direcciones (
  id                  uuid primary key default uuid_generate_v4(),
  usuario_id          uuid not null references public.perfiles(id) on delete cascade,
  nombre_destinatario text not null,
  telefono            text not null,
  departamento        text not null,
  provincia           text not null,
  distrito            text not null,
  direccion           text not null,
  referencia          text,
  codigo_postal       text,
  es_predeterminada   boolean not null default false,
  created_at          timestamptz not null default now()
);

-- Solo una dirección predeterminada por usuario
create unique index idx_direccion_predeterminada
  on public.direcciones(usuario_id)
  where es_predeterminada = true;

-- ============================================================
-- CATEGORÍAS
-- ============================================================
create table public.categorias (
  id          uuid primary key default uuid_generate_v4(),
  nombre      text not null,
  slug        text not null unique,
  descripcion text,
  imagen_url  text,
  activa      boolean not null default true,
  orden       integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- PRODUCTOS
-- ============================================================
create table public.productos (
  id              uuid primary key default uuid_generate_v4(),
  categoria_id    uuid references public.categorias(id) on delete set null,
  nombre          text not null,
  slug            text not null unique,
  descripcion     text,
  precio          numeric(10,2) not null check (precio >= 0),  -- en soles (PEN)
  precio_oferta   numeric(10,2) check (precio_oferta >= 0),    -- null = sin oferta
  sku             text unique,
  imagenes        jsonb not null default '[]',    -- [{url, alt, orden}]
  activo          boolean not null default true,
  destacado       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_productos_categoria on public.productos(categoria_id);
create index idx_productos_slug on public.productos(slug);
-- Búsqueda de texto en nombre y descripción
create index idx_productos_busqueda on public.productos
  using gin(to_tsvector('spanish', nombre || ' ' || coalesce(descripcion, '')));

-- ============================================================
-- VARIANTES DE PRODUCTO (talla + color)
-- Cada combinación única tiene su propio stock
-- ============================================================
create table public.variantes (
  id          uuid primary key default uuid_generate_v4(),
  producto_id uuid not null references public.productos(id) on delete cascade,
  talla       text,   -- XS, S, M, L, XL, XXL | 28, 30, 32... | Único
  color       text,
  stock       integer not null default 0 check (stock >= 0),
  sku_variante text,
  activa      boolean not null default true,
  created_at  timestamptz not null default now(),
  unique(producto_id, talla, color)
);

create index idx_variantes_producto on public.variantes(producto_id);

-- ============================================================
-- PEDIDOS
-- ============================================================
create type estado_pedido as enum (
  'pendiente',     -- creado, esperando pago
  'pagado',        -- pago confirmado
  'preparando',    -- en bodega/almacén
  'enviado',       -- con courier
  'entregado',     -- entrega confirmada
  'cancelado',
  'reembolsado'
);

create table public.pedidos (
  id                  uuid primary key default uuid_generate_v4(),
  usuario_id          uuid references public.perfiles(id) on delete set null,
  numero              serial,                             -- número legible (#0001, #0002…)
  estado              estado_pedido not null default 'pendiente',
  subtotal            numeric(10,2) not null,             -- sin IGV
  igv                 numeric(10,2) not null default 0,   -- 18% en Perú
  costo_envio         numeric(10,2) not null default 0,
  total               numeric(10,2) not null,             -- subtotal + igv + envio
  moneda              char(3) not null default 'PEN',
  -- Snapshot de dirección al momento de comprar
  direccion_envio     jsonb not null,
  -- Datos del comprador (por si es guest o cambia su perfil)
  nombre_comprador    text not null,
  email_comprador     text not null,
  telefono_comprador  text,
  notas               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_pedidos_usuario on public.pedidos(usuario_id);
create index idx_pedidos_estado on public.pedidos(estado);
create index idx_pedidos_numero on public.pedidos(numero);

-- ============================================================
-- ÍTEMS DEL PEDIDO
-- Snapshot de precio al momento de la compra
-- ============================================================
create table public.items_pedido (
  id                uuid primary key default uuid_generate_v4(),
  pedido_id         uuid not null references public.pedidos(id) on delete cascade,
  producto_id       uuid references public.productos(id) on delete set null,
  variante_id       uuid references public.variantes(id) on delete set null,
  -- Snapshot (el producto puede cambiar de precio después)
  nombre_producto   text not null,
  talla             text,
  color             text,
  precio_unitario   numeric(10,2) not null,
  cantidad          integer not null check (cantidad > 0),
  subtotal          numeric(10,2) generated always as (precio_unitario * cantidad) stored
);

create index idx_items_pedido on public.items_pedido(pedido_id);

-- ============================================================
-- PAGOS (integración Culqi)
-- Culqi trabaja en centavos (ej: S/. 99.90 → 9990)
-- ============================================================
create type estado_pago as enum (
  'pendiente',
  'completado',
  'fallido',
  'reembolsado'
);

create type metodo_pago as enum (
  'tarjeta',   -- crédito/débito vía Culqi
  'yape',      -- Yape (Culqi lo soporta)
  'plin',      -- Plin
  'cuotas'     -- MSI vía Culqi
);

create table public.pagos (
  id                  uuid primary key default uuid_generate_v4(),
  pedido_id           uuid not null references public.pedidos(id) on delete restrict,
  estado              estado_pago not null default 'pendiente',
  metodo              metodo_pago,
  -- IDs de Culqi
  culqi_charge_id     text unique,       -- ch_xxx
  culqi_order_id      text,              -- ord_xxx (si usas Culqi Orders)
  culqi_token_id      text,              -- tok_xxx
  -- Montos (en soles, para evitar confusión)
  monto               numeric(10,2) not null,
  moneda              char(3) not null default 'PEN',
  -- Respuesta completa de Culqi (para auditoría)
  respuesta_culqi     jsonb,
  -- Datos de la tarjeta (solo lo no sensible)
  ultimos_4_digitos   char(4),
  marca_tarjeta       text,              -- visa, mastercard, amex
  error_mensaje       text,             -- si el pago falló
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_pagos_pedido on public.pagos(pedido_id);
create index idx_pagos_culqi_charge on public.pagos(culqi_charge_id);

-- ============================================================
-- TRIGGERS: updated_at automático
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_perfiles_updated_at
  before update on public.perfiles
  for each row execute function set_updated_at();

create trigger trg_productos_updated_at
  before update on public.productos
  for each row execute function set_updated_at();

create trigger trg_pedidos_updated_at
  before update on public.pedidos
  for each row execute function set_updated_at();

create trigger trg_pagos_updated_at
  before update on public.pagos
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.perfiles      enable row level security;
alter table public.direcciones   enable row level security;
alter table public.pedidos       enable row level security;
alter table public.items_pedido  enable row level security;
alter table public.pagos         enable row level security;
alter table public.categorias    enable row level security;
alter table public.productos     enable row level security;
alter table public.variantes     enable row level security;

-- Categorías y productos: lectura pública
create policy "productos_lectura_publica" on public.productos
  for select using (activo = true);

create policy "categorias_lectura_publica" on public.categorias
  for select using (activa = true);

create policy "variantes_lectura_publica" on public.variantes
  for select using (activa = true);

-- Perfiles: cada usuario solo ve/edita el suyo
create policy "perfil_propio" on public.perfiles
  for all using (auth.uid() = id);

-- Direcciones: solo el dueño
create policy "direcciones_propias" on public.direcciones
  for all using (auth.uid() = usuario_id);

-- Pedidos: usuario ve sus propios pedidos
create policy "pedidos_propios" on public.pedidos
  for select using (auth.uid() = usuario_id);

create policy "crear_pedido" on public.pedidos
  for insert with check (auth.uid() = usuario_id);

-- Ítems: accesibles si el pedido pertenece al usuario
create policy "items_pedido_propios" on public.items_pedido
  for select using (
    exists (
      select 1 from public.pedidos p
      where p.id = pedido_id and p.usuario_id = auth.uid()
    )
  );

-- Pagos: solo lectura del usuario dueño del pedido
create policy "pagos_propios" on public.pagos
  for select using (
    exists (
      select 1 from public.pedidos p
      where p.id = pedido_id and p.usuario_id = auth.uid()
    )
  );
