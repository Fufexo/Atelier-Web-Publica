import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import ProductGrid from '@/components/store/ProductGrid'
import PageHeader from '@/components/ui/PageHeader'
import { getCatalogo, getCategoriasActivas, leerFiltros, type FiltrosCatalogo } from '@/lib/catalogo'
import { capitalizar } from '@/lib/format'
import type { Categoria } from '@/lib/types'
import Filtros from './Filtros'

function titulo(filtros: FiltrosCatalogo, categorias: Categoria[]): string {
  if (filtros.busqueda) return `Resultados para “${filtros.busqueda}”`
  if (filtros.genero) return capitalizar(filtros.genero)
  if (filtros.categoria) return categorias.find((c) => c.slug === filtros.categoria)?.nombre ?? 'Colección'
  if (filtros.novedad) return 'Novedades'
  if (filtros.oferta) return 'Ofertas'
  return 'Toda la colección'
}

export async function generateMetadata({ searchParams }: PageProps<'/tienda'>): Promise<Metadata> {
  const filtros = leerFiltros(await searchParams)
  const nombre = filtros.genero
    ? capitalizar(filtros.genero)
    : filtros.categoria
      ? capitalizar(filtros.categoria.replace(/-/g, ' '))
      : 'Tienda'
  return {
    title: nombre,
    // Las búsquedas no se indexan: generan páginas casi duplicadas sin fin.
    robots: filtros.busqueda ? { index: false } : undefined,
    alternates: { canonical: '/tienda' + (filtros.genero ? `?genero=${filtros.genero}` : '') },
  }
}

export default async function TiendaPage({ searchParams }: PageProps<'/tienda'>) {
  const filtros = leerFiltros(await searchParams)
  const [categorias, productos] = await Promise.all([getCategoriasActivas(), getCatalogo(filtros)])

  return (
    <>
      <Suspense>
        <Filtros categorias={categorias} />
      </Suspense>

      <div className="bg-crema flex-1">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-8">
          <PageHeader
            titulo={titulo(filtros, categorias)}
            descripcion={`${productos.length} ${productos.length === 1 ? 'producto' : 'productos'}`}
          />

          {productos.length === 0 ? (
            <div className="py-32 text-center">
              <p className="mb-4 font-serif text-lg text-stone-500">No hay productos en esta selección.</p>
              <Link
                href="/tienda"
                className="text-xs tracking-widest text-stone-600 uppercase underline underline-offset-4 transition-colors hover:text-stone-900"
              >
                Ver toda la colección
              </Link>
            </div>
          ) : (
            <ProductGrid productos={productos} />
          )}
        </div>
      </div>
    </>
  )
}
