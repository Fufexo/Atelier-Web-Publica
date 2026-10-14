# ATELIER — Guía para agentes IA

## Qué es este proyecto

E-commerce de ropa para el mercado peruano. Tienda pública + panel admin + checkout con pago real (Culqi). Deploy en Vercel, base de datos en Supabase. La arquitectura y las decisiones están en `README.md`.

---

## Stack — versiones con breaking changes

- **Next.js 16** con App Router. Ante dudas, leer `node_modules/next/dist/docs/`. `params` y `searchParams` son **Promises**: siempre `await`. Usar los helpers globales `PageProps<'/ruta'>` y `LayoutProps<'/ruta'>`.
- El middleware se llama **`proxy.ts`** y solo corre en `/admin` y `/login`.
- **React 19.3**: `<ViewTransition>` viene de `react` (no usar `next-view-transitions`). Preferir `useOptimistic`, `useActionState` y `useSyncExternalStore` a `useEffect` + `setState`.
- **Tailwind CSS v4**: sin `tailwind.config.ts`; tokens en `@theme` dentro de `app/globals.css`.
- **Supabase SSR** (`@supabase/ssr`), clientes tipados con `Database` (`lib/supabase/database.types.ts`).
- **Zod 4** para validar todo lo que llega del cliente (formularios, API, Server Actions).
- **TypeScript strict**: sin `any`, sin ignorar errores.

---

## Dónde vive cada cosa

```
app/(tienda)/           → Tienda pública. El layout ya pone Navbar, Footer y <main>: las páginas no los repiten.
app/admin/              → Panel. Cada página y Server Action llama a requireAdmin().
app/api/culqi/cobrar/   → Único API route: valida, recalcula, cobra y registra el pedido.
components/ui/          → Primitivas: Icon, boton(), Field, QuantityStepper, PageHeader, EmptyState
components/store/       → Piezas de la tienda: ProductCard, ProductGrid, ResumenTotales, PaginaInfo, Reveal…
components/admin/ui.tsx → Card, CardHeader, AdminHeader, badges de estado, inputAdmin/botonAdmin
lib/catalogo.ts         → Consultas de la tienda (no consultar Supabase directo desde las páginas públicas)
lib/auth.ts             → requireAdmin()
lib/checkout/           → schema.ts (Zod, compartido) y armar-pedido.ts (puro)
lib/carrito/            → items.ts (lógica pura) e index.ts (useCarrito, store en localStorage)
lib/precios.ts          → IGV, totales, precioFinal, aCentimos
lib/envios.ts           → Tarifas por distrito (única fuente: checkout y servidor)
lib/pedidos.ts          → Estados de pedido/pago (label, colores), stock bajo
lib/format.ts           → formatearPrecio, formatearFecha, fechas en hora de Lima, generarSlug
lib/supabase/           → server.ts (SSR) · client.ts (browser) · admin.ts (service role, solo servidor)
supabase/migrations/    → SQL en orden. NO borrar ni editar migraciones ya aplicadas: crear una nueva.
```

---

## Base de datos

Tablas: `admins`, `perfiles`, `categorias`, `productos`, `variantes`, `pedidos`, `items_pedido`, `pagos`.

- Escritura del panel y lectura de pedidos: políticas RLS con `(select public.es_admin())`.
- La tienda pública lee con la anon key: RLS solo deja ver lo activo.
- Los pedidos se registran **solo** con `registrar_pedido_pagado` (service role), en una transacción.
- Columnas JSONB (`productos.imagenes`, `pedidos.direccion_envio`): leerlas con `parsearImagenes` / `parsearDireccion` de `lib/types.ts`.
- Después de una migración, regenerar `database.types.ts`.

---

## Convenciones

### Datos y seguridad
- Nunca confiar en montos ni precios que vengan del navegador.
- Toda Server Action: `const { supabase } = await requireAdmin()` + validar argumentos con Zod (llegan del cliente aunque el tipo diga otra cosa).
- Devolver errores al usuario (`{ error }` o `throw`); no ignorar el `error` de Supabase.
- Texto del usuario dentro de HTML de emails: `escaparHtml`.
- Fechas y "hoy": hora de Lima (`lib/format.ts`), nunca la del servidor.

### Estilos
- Fuentes: `font-serif` (Playfair, títulos) y `font-sans` (Inter, por defecto en `body`). No usar `style={{ fontFamily }}`.
- Colores de marca: `bg-papel`, `bg-crema`, `bg-lino`, `bg-tinta`, `text-tinta-claro`… (definidos en `@theme`).
- Contraste: texto secundario `stone-500` sobre blanco, `stone-600` sobre `crema`. No usar `stone-400` para texto.
- Botones y enlaces de acción de la tienda: `className={boton({ variante })}`.
- Imágenes con `next/image`; íconos con `<Icon name="…" />`.
- `md` (768px) separa móvil/escritorio en la tienda.

### Componentes reutilizables
- `ProductCard` / `ProductGrid` para cualquier listado de productos.
- `ResumenTotales` para desgloses de subtotal/IGV/envío/total.
- `PaginaInfo` para páginas de ayuda con secciones de texto.
- `Field` para campos de formulario de la tienda (label conectado y errores accesibles).
- `ConfirmDeleteButton` para acciones destructivas en el admin.
- Links de navegación: `NAV_PRINCIPAL`, `NAV_TIENDA`, `NAV_AYUDA` de `lib/navigation.ts`.

### Emails
Instanciar `Resend` dentro de la función, nunca a nivel de módulo (rompe el build de Vercel sin la variable).

### Antes de terminar un cambio
`npm run check` (lint + tipos + tests) y `npm run format`. Si tocaste lógica de `lib/`, agrega o actualiza su `*.test.ts`.

---

## Qué NO hacer

- No crear páginas de auth para clientes: solo el admin tiene login.
- No duplicar Navbar/Footer en páginas de `(tienda)`.
- No hardcodear precios ni tarifas de envío en componentes.
- No usar el cliente service role (`lib/supabase/admin.ts`) fuera del servidor.
- No volver a `auth.uid() is not null` como criterio de admin.

---

## Variables de entorno

Ver `.env.example`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_CULQI_PUBLIC_KEY`, `CULQI_SECRET_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_ADMIN`, `NEXT_PUBLIC_SITE_URL`.
