# ATELIER — Guía para agentes IA

## Qué es este proyecto

E-commerce de ropa para el mercado peruano. Tienda pública + panel admin + checkout con pago real (Culqi). Deployed en Vercel, DB en Supabase.

---

## Stack — versiones con breaking changes

- **Next.js 16** con App Router. Leer `node_modules/next/dist/docs/` ante dudas. `generateMetadata`, `searchParams` y `params` son **Promises** — siempre `await`.
- **React 19** — no usar patrones deprecados de React 18.
- **Tailwind CSS v4** — sintaxis nueva, sin `tailwind.config.ts`, configuración vía `@theme` en `globals.css`.
- **Supabase SSR** (`@supabase/ssr`) — no usar el cliente legacy `@supabase/auth-helpers-nextjs`.
- **TypeScript strict** — no usar `any`, no ignorar errores de tipos.

---

## Dónde vive cada cosa

```
app/                    → Rutas (App Router)
  admin/                → Panel admin (protegido por layout.tsx via Supabase Auth)
  api/culqi/cobrar/     → Único API route — procesa pagos
  login/                → Auth solo para admin
components/
  store/                → Componentes de la tienda pública
  admin/                → Componentes del panel admin
lib/
  supabase/server.ts    → Cliente SSR (Server Components y Actions)
  supabase/client.ts    → Cliente browser (solo en Client Components)
  supabase/admin.ts     → Cliente service role (bypasa RLS, solo en API routes)
  carrito.tsx           → Context + hook useCarrito
  email.ts              → Emails con Resend (inicializar dentro de cada función, no al importar)
  navigation.ts         → Links de nav centralizados (NAV_TIENDA, NAV_AYUDA)
  types.ts              → Tipos globales
  utils.ts              → formatearPrecio, generarSlug, ESTADO_PEDIDO_*
supabase/migrations/    → Scripts SQL — NO borrar
```

---

## Base de datos (Supabase)

Tablas principales: `perfiles`, `categorias`, `productos`, `variantes`, `pedidos`, `items_pedido`, `pagos`

- `productos` tiene: `nombre`, `slug`, `precio`, `precio_oferta`, `imagenes` (JSONB), `activo`, `destacado`, `genero`, `orden`, `categoria_id`
- `variantes` tiene: `talla`, `color`, `stock`, `activa`
- `pedidos` tiene: `estado` (pendiente→pagado→preparando→enviado→entregado), `direccion_envio` (JSONB)
- Stock se descuenta via RPC `descontar_stock(p_variante_id, p_cantidad)`

---

## Convenciones de código

### Patrones de Supabase
```ts
// Server Component / Action
const supabase = await createClient()

// API Route (bypasa RLS)
const supabase = createAdminClient()  // sin await
```

### Estilos
- Fuente serif: `style={{ fontFamily: 'var(--font-noto-serif)' }}` — títulos
- Fuente sans: `style={{ fontFamily: 'var(--font-manrope)' }}` — texto UI
- Paleta base: `stone-900` (primario), `stone-400` (secundario), `[#f5f2ed]` (fondo tienda), `[#25211f]` (footer)
- Breakpoints: `md` (768px) separa mobile/desktop en la tienda

### Componentes reutilizables clave
- `<ProductCard prod={prod} hover={boolean} />` — card de producto, usar siempre en vez de código inline
- `<ConfirmDeleteButton>` — para acciones destructivas en admin
- `<ViewTransitionGuard />` — ya montado en layout, no duplicar

### Emails
```ts
// CORRECTO — inicializar dentro de la función
export async function enviarEmail() {
  const resend = new Resend(process.env.RESEND_API_KEY)
  ...
}

// MAL — falla en build time de Vercel
const resend = new Resend(process.env.RESEND_API_KEY)
```

---

## Qué NO hacer

- No crear páginas de auth para clientes — solo el admin tiene login
- No usar `<img>` con dominios externos sin configurar `next.config` (usar `// eslint-disable-next-line` si es necesario por ahora)
- No hardcodear precios en los componentes — siempre vienen de Supabase
- No duplicar el card de producto — usar `ProductCard`
- No duplicar los links de nav — usar `NAV_TIENDA` y `NAV_AYUDA` de `lib/navigation.ts`
- No inicializar `Resend` a nivel de módulo
- No borrar los archivos de `supabase/migrations/`

---

## Variables de entorno necesarias

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_CULQI_PUBLIC_KEY
CULQI_SECRET_KEY
RESEND_API_KEY
EMAIL_ADMIN
NEXT_PUBLIC_SITE_URL
```
