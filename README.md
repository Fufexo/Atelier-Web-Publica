# ATELIER — Tienda de Ropa Online

E-commerce de moda para el mercado peruano. Incluye tienda, carrito, checkout con pago real, panel de administración y emails transaccionales.

🌐 **Producción:** [atelier-ropa.vercel.app](https://atelier-ropa.vercel.app)

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Components) |
| UI | [React 19](https://react.dev) |
| Tipado | [TypeScript 5](https://www.typescriptlang.org) |
| Estilos | [Tailwind CSS v4](https://tailwindcss.com) |
| Base de datos | [Supabase](https://supabase.com) (PostgreSQL + Auth + Storage) |
| Pagos | [Culqi](https://culqi.com) (tarjetas de crédito/débito, Perú) |
| Emails | [Resend](https://resend.com) |
| Animaciones | [next-view-transitions](https://github.com/shuding/next-view-transitions) |
| Deploy | [Vercel](https://vercel.com) |

---

## Funcionalidades

### Tienda
- Catálogo con filtros por género, categoría y búsqueda con debounce
- Carrusel de 1 producto en mobile, grid en desktop
- Páginas de producto con galería de imágenes y selector de talla/color
- Carrito persistente en localStorage

### Checkout
- Formulario de contacto y dirección de envío
- Pago con tarjeta vía Culqi (tokenización segura)
- Descuento de stock automático tras pago exitoso
- Email de confirmación al cliente y notificación al admin

### Panel Admin (`/admin`)
- Dashboard con stats del día
- CRUD de productos (imágenes, variantes, stock)
- CRUD de categorías
- Gestión de pedidos con cambio de estado
- Analíticas: gráfico de ventas 30 días, top productos más vendidos
- Alertas de stock bajo (≤ 5 unidades)
- Modo oscuro

---

## Estructura del proyecto

```
app/
├── (tienda)         → /, /tienda, /producto/[slug], /carrito, /checkout
├── admin/           → Dashboard, productos, categorías, pedidos, analíticas
├── api/culqi/       → Endpoint de cobro
├── login/           → Auth admin
└── (info)           → /contacto, /envios, /devoluciones, /guia-de-tallas

components/
├── store/           → Navbar, Footer, ProductCard, ProductCarousel
└── admin/           → Sidebar, ProductoForm, VariantesEditor

lib/
├── supabase/        → Clientes server / client / admin
├── carrito.tsx      → Contexto del carrito
├── email.ts         → Templates de emails (Resend)
├── navigation.ts    → Links de navegación centralizados
├── types.ts         → Tipos TypeScript globales
└── utils.ts         → Helpers (precios, slugs, estados de pedido)

supabase/
└── migrations/      → Scripts SQL de la base de datos
```

---

## Variables de entorno

Crea un archivo `.env.local` con:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Culqi
NEXT_PUBLIC_CULQI_PUBLIC_KEY=
CULQI_SECRET_KEY=

# Resend (emails)
RESEND_API_KEY=
EMAIL_ADMIN=

# URL del sitio
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

El panel admin está en [http://localhost:3000/admin](http://localhost:3000/admin) — requiere usuario creado en Supabase Auth.

---

## Base de datos

Las migraciones están en `supabase/migrations/`. Ejecutarlas en orden en el SQL Editor de Supabase:

1. `001_schema_inicial.sql` — Tablas principales
2. `002_admin_policies.sql` — Políticas RLS
3. `003_orden_productos.sql` — Campo de orden
4. `004_genero_productos.sql` — Campo de género
