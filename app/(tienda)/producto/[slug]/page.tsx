import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { getProductoPorSlug } from '@/lib/catalogo'
import { precioFinal } from '@/lib/precios'
import { SITE_URL } from '@/lib/site'
import ProductoDetalle from './ProductoDetalle'

// generateMetadata y la página piden el mismo producto: cache() hace una sola consulta.
const getProducto = cache(getProductoPorSlug)

export async function generateMetadata({ params }: PageProps<'/producto/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const prod = await getProducto(slug)
  if (!prod) return { title: 'Producto no encontrado' }

  const imagen = prod.imagenes[0]
  const descripcion = prod.descripcion ?? `Compra ${prod.nombre} en ATELIER. Envíos a todo el Perú.`
  return {
    title: prod.nombre,
    description: descripcion,
    alternates: { canonical: `/producto/${slug}` },
    openGraph: {
      title: prod.nombre,
      description: descripcion,
      url: `/producto/${slug}`,
      images: imagen ? [{ url: imagen.url, alt: imagen.alt || prod.nombre }] : undefined,
    },
  }
}

export default async function ProductoPage({ params }: PageProps<'/producto/[slug]'>) {
  const { slug } = await params
  const prod = await getProducto(slug)
  if (!prod) notFound()

  const hayStock = prod.variantes.some((v) => v.stock > 0)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: prod.nombre,
    description: prod.descripcion ?? undefined,
    image: prod.imagenes.map((i) => i.url),
    sku: prod.sku ?? undefined,
    category: prod.categoria?.nombre,
    brand: { '@type': 'Brand', name: 'ATELIER' },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/producto/${slug}`,
      priceCurrency: 'PEN',
      price: precioFinal(prod).toFixed(2),
      availability: hayStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <div className="flex-1 bg-white">
      <script
        type="application/ld+json"
        // JSON.stringify no escapa "<": se reemplaza para que un nombre con </script> no rompa la página.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\u003c') }}
      />
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-8">
        <nav aria-label="Ruta de navegación" className="mb-10 text-xs text-stone-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-stone-800">
                Inicio
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/tienda" className="hover:text-stone-800">
                Tienda
              </Link>
            </li>
            {prod.categoria && (
              <>
                <li aria-hidden>/</li>
                <li>
                  <Link href={`/tienda?categoria=${prod.categoria.slug}`} className="hover:text-stone-800">
                    {prod.categoria.nombre}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-stone-700">
              {prod.nombre}
            </li>
          </ol>
        </nav>

        <div className="mb-8">
          {prod.categoria && (
            <p className="mb-2 text-xs tracking-[0.3em] text-stone-500 uppercase">{prod.categoria.nombre}</p>
          )}
          <h1 className="font-serif text-3xl leading-tight text-stone-900 md:text-4xl">{prod.nombre}</h1>
        </div>

        <ProductoDetalle
          productoId={prod.id}
          slug={prod.slug}
          nombre={prod.nombre}
          descripcion={prod.descripcion}
          precio={prod.precio}
          precioOferta={prod.precio_oferta}
          imagenes={prod.imagenes}
          variantes={prod.variantes}
        />
      </div>
    </div>
  )
}
