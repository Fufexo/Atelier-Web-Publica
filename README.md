# ATELIER — Tienda de ropa online

E-commerce de moda para el mercado peruano: catálogo con filtros, carrito, checkout con pago real (Culqi), panel de administración y emails transaccionales.

**Producción → [atelier-ropa.vercel.app](https://atelier-ropa.vercel.app)**

## Qué tiene

### Tienda

- Catálogo con filtros por género, categoría y novedades, y búsqueda con debounce. Los filtros viven en la URL (se comparten y funcionan con atrás/adelante) y se marcan al instante con `useOptimistic`.
- Carrusel con snap en móvil y grilla desde tablet, en una sola lista (sin DOM duplicado por breakpoint).
- Ficha de producto con galería, selector de color/talla sincronizado con las imágenes, stock por variante y datos estructurados (`schema.org/Product`).
- Carrito persistente en `localStorage`, sincronizado entre pestañas.
- Menú móvil accesible (foco, <kbd>Esc</kbd>, `aria-expanded`), enlace "saltar al contenido" y transiciones entre páginas con `<ViewTransition>` de React.

### Checkout

- Envío por distrito de Lima o provincia, con la tarifa visible antes de pagar.
- Validación con los mismos esquemas (Zod) en el navegador y en el servidor: errores junto a cada campo y foco en el primero.
- Pago con tarjeta vía Culqi. **El servidor recalcula precios, stock, envío y total desde la base**; el navegador solo dice qué variantes y cuántas.
- Pedido, ítems, descuento de stock y pago se registran en una sola transacción. Si falla después de cobrar, el cargo se reembolsa automáticamente.
- Email de confirmación al cliente y aviso al admin, enviados después de responder (`after()`).

### Panel admin (`/admin`)

- Acceso solo para usuarios en la tabla `admins` (no basta con tener cuenta en Supabase Auth).
- Dashboard con ventas del día en hora de Lima, CRUD de productos (imágenes, variantes, stock) y categorías, gestión de pedidos por estado, analíticas de 30 días con gráfico accesible y alertas de stock bajo.
- Modo oscuro.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions, `proxy.ts`) |
| UI | React 19.3 (`useOptimistic`, `useActionState`, `useSyncExternalStore`, `<ViewTransition>`) |
| Estilos | Tailwind CSS v4 con tokens de diseño en `@theme` |
| Datos | Supabase: PostgreSQL con RLS, Auth y Storage; tipos generados desde el esquema |
| Validación | Zod 4, compartido entre cliente y servidor |
| Pagos | Culqi (tokenización en el navegador, cargo en el servidor) |
| Emails | Resend |
| Tests | Vitest · GitHub Actions (formato, lint, tipos, tests y build en cada push) |
| Deploy | Vercel |

## Decisiones técnicas

- **El servidor decide cuánto cobrar.** `POST /api/culqi/cobrar` recibe variantes, cantidades y destino; lee precios y stock con el service role y arma el pedido con una función pura (`lib/checkout/armar-pedido.ts`). Si el total que vio el cliente no coincide (precio cambiado o petición manipulada), no cobra y devuelve el precio y stock actuales para que el carrito se corrija solo.
- **Pedido atómico con compensación.** La función SQL `registrar_pedido_pagado` inserta pedido, ítems y pago y descuenta stock en una transacción; si falta stock, nada queda a medias. Como el cobro ocurre antes (Culqi no participa de la transacción), un fallo posterior dispara un reembolso.
- **Autorización en la base, no solo en la UI.** Las políticas RLS usan `es_admin()` (tabla `admins`). `proxy.ts` exige sesión en `/admin`, y `requireAdmin()` (memoizada por request) verifica el rol en el layout y en cada Server Action.
- **Una capa de datos tipada.** `lib/catalogo.ts` concentra las consultas de la tienda y convierte las columnas JSONB (`imagenes`, `direccion_envio`) a tipos validados. Los clientes de Supabase usan `Database` generado desde el esquema.
- **Lógica de negocio pura y testeada.** Precios e IGV, tarifas de envío, carrito, armado del pedido, fechas en hora de Lima y agregados de analíticas son funciones sin React ni red.
- **Carrito como store externo.** `useSyncExternalStore` sobre `localStorage` reemplaza el patrón "leer en `useEffect` y hacer `setState`", que en StrictMode podía pisar el carrito guardado. Tolera JSON corrupto y almacenamiento bloqueado.
- **Variantes con identidad estable.** Al editar un producto, las variantes se actualizan por `id` en vez de borrarse y recrearse: no se rompen carritos abiertos ni el vínculo de pedidos anteriores.
- **Sin JavaScript para animar.** Las apariciones al hacer scroll son CSS (`animation-timeline: view()`): el contenido llega visible en el HTML y, sin soporte o con movimiento reducido, simplemente no se anima.
- **Rendimiento.** Imágenes con `next/image` (AVIF/WebP, `sizes`, `preload` en el hero), íconos SVG inline en vez de una fuente de íconos externa, fuentes con `next/font` y `proxy.ts` limitado a `/admin` y `/login` (la tienda pública no consulta Auth en cada request).
- **SEO.** Metadata por página, `canonical`, Open Graph, `sitemap.xml` con los productos activos, `robots.txt` y `noindex` en carrito, checkout, búsquedas y admin.

## Calidad

- **Tests unitarios** (Vitest): precios e IGV, envíos, carrito (incluida la sincronización con el servidor), armado del pedido y esquema del checkout, escape de HTML en emails, fechas en Lima, analíticas, navegación y parseo de JSONB.
- **Migraciones probadas** contra un Postgres real: políticas de admin y no-admin, Storage, la transacción del pedido (incluido el rollback por falta de stock) e idempotencia.
- **Accesibilidad:** 0 violaciones de axe-core (WCAG 2.1 AA) en inicio, tienda, producto, carrito y checkout.
- **CI** en GitHub Actions: `format:check`, `lint`, `typecheck`, `test` y `build`.

## Estructura

```
app/
├── (tienda)/              # tienda pública: layout con Navbar + Footer
│   ├── page.tsx           #   /
│   ├── tienda/            #   catálogo + Filtros
│   ├── producto/[slug]/   #   ficha + JSON-LD
│   ├── carrito/  checkout/
│   └── envios/  devoluciones/  contacto/  nosotros/  guia-de-tallas/
├── admin/                 # panel (requireAdmin en el layout y en cada acción)
├── api/culqi/cobrar/      # único endpoint: cobra y registra el pedido
├── login/
├── sitemap.ts  robots.ts  not-found.tsx
components/
├── ui/                    # Icon, boton(), Field, QuantityStepper, PageHeader, EmptyState
├── store/                 # Navbar, Footer, ProductCard, ProductGrid, ResumenTotales, Reveal…
└── admin/                 # ui.tsx (Card, badges, estilos), ProductoForm, VariantesEditor…
lib/
├── supabase/              # clientes server/browser/admin + database.types.ts
├── checkout/              # schema (Zod) y armar-pedido (puro)
├── carrito/               # lógica pura + store
├── catalogo.ts            # consultas de la tienda
├── auth.ts                # requireAdmin()
├── precios.ts  envios.ts  pedidos.ts  format.ts  analiticas.ts
├── culqi.ts  email.ts
└── navigation.ts  site.ts  types.ts
supabase/migrations/       # 001 → 006
```

## Correr el proyecto

Requiere Node 22 o superior.

```bash
cp .env.example .env.local   # completar valores
npm install
npm run dev
```

| Script | |
|---|---|
| `npm run dev` | servidor de desarrollo |
| `npm run check` | lint + tipos + tests |
| `npm test` | tests unitarios |
| `npm run format` | Prettier (con orden de clases de Tailwind) |
| `npm run build` | build de producción |

El panel está en `/admin`. Para dar acceso a un usuario de Supabase Auth:

```sql
insert into public.admins (user_id) values ('<uuid del usuario>');
```

## Base de datos

Las migraciones están en `supabase/migrations/` y se aplican en orden (SQL Editor o `supabase db push`):

1. `001_schema_inicial.sql`: tablas principales y RLS de lectura pública
2. `002_admin_policies.sql`: políticas del panel (reemplazadas en 006)
3. `003_orden_productos.sql`: orden manual de productos
4. `004_genero_productos.sql`: género
5. `005_descontar_stock.sql`: función que existía en producción y faltaba en el repo
6. `006_admins_y_pedido_atomico.sql`: tabla `admins`, políticas por rol, Storage de categorías y `registrar_pedido_pagado`
7. `007_revocar_rls_auto_enable.sql`: la función del trigger `ensure_rls` deja de ser invocable por la API
8. `008_rls_initplan.sql`: `(select auth.uid())` en las políticas de 001 (aviso de rendimiento)

Después de cambiar el esquema, regenerar los tipos: `npx supabase gen types typescript --project-id <id> > lib/supabase/database.types.ts`.
