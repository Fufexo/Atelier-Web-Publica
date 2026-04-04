import { Suspense } from 'react'
import { Link } from 'next-view-transitions'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import Filtros from './Filtros'
import ProductCard from '@/components/store/ProductCard'
import type { Producto, Categoria } from '@/lib/types'

interface SearchParams {
  genero?: string
  categoria?: string
  novedad?: string
  oferta?: string
  q?: string
}

interface Props {
  searchParams: Promise<SearchParams>
}

export async function generateMetadata({ searchParams }: Props) {
  const { genero, categoria } = await searchParams
  const titulo = genero
    ? `${genero.charAt(0).toUpperCase() + genero.slice(1)} — Atelier`
    : categoria
      ? `${categoria.charAt(0).toUpperCase() + categoria.slice(1)} — Atelier`
      : 'Tienda — Atelier'
  return { title: titulo }
}

export default async function TiendaPage({ searchParams }: Props) {
  const { genero, categoria, novedad, oferta, q: busqueda } = await searchParams
  const supabase = await createClient()

  // Buscar categoria_id si hay filtro de categoría (evita filtrar por join)
  let categoriaId: string | null = null
  if (categoria) {
    const { data: cat } = await supabase
      .from('categorias')
      .select('id')
      .eq('slug', categoria)
      .single()
    categoriaId = cat?.id ?? null
  }

  const [{ data: categorias }, { data: rawProductos }] = await Promise.all([
    supabase.from('categorias').select('*').eq('activa', true).order('orden'),
    (() => {
      let q = supabase
        .from('productos')
        .select('*, categorias(nombre, slug)')
        .eq('activo', true)
        .order('orden', { ascending: true })
        .order('created_at', { ascending: false })

      if (genero) q = q.eq('genero', genero)
      if (novedad === 'true') q = q.eq('destacado', true)
      if (oferta === 'true') q = q.not('precio_oferta', 'is', null)
      if (categoriaId) q = q.eq('categoria_id', categoriaId)
      if (busqueda?.trim()) q = q.ilike('nombre', `%${busqueda.trim()}%`)

      return q
    })(),
  ])

  const productos: Producto[] = rawProductos ?? []
  const cats: Categoria[] = categorias ?? []

  const tituloSeccion = busqueda?.trim()
    ? `Resultados para "${busqueda.trim()}"`
    : genero
      ? genero.charAt(0).toUpperCase() + genero.slice(1)
      : categoria
        ? cats.find((c) => c.slug === categoria)?.nombre ?? 'Colección'
        : novedad === 'true'
          ? 'Novedades'
          : oferta === 'true'
            ? 'Ofertas'
            : 'Toda la colección'

  return (
    <>
      <Navbar />
      <Suspense>
        <Filtros categorias={cats} />
      </Suspense>

      <main className="bg-[#f5f2ed] min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h1 className="text-3xl text-stone-900" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                {tituloSeccion}
              </h1>
              <p className="text-sm text-stone-400 mt-1" style={{ fontFamily: 'var(--font-manrope)' }}>
                {productos.length} {productos.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>
          </div>

          {productos.length === 0 ? (
            <div className="text-center py-32">
              <p className="text-stone-400 text-lg mb-4" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                No hay productos en esta selección.
              </p>
              <Link
                href="/tienda"
                className="text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900 underline underline-offset-4 transition-colors"
                style={{ fontFamily: 'var(--font-manrope)' }}
              >
                Ver toda la colección
              </Link>
            </div>
          ) : (
            <>
              {/* Mobile: carrusel */}
              <div className="md:hidden -mx-8 overflow-x-auto snap-x snap-mandatory flex pb-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {productos.map((prod) => (
                  <div key={prod.id} className="snap-center shrink-0 w-full px-8">
                    <ProductCard prod={prod} hover={false} />
                  </div>
                ))}
              </div>

              {/* Tablet+: grid */}
              <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                {productos.map((prod) => (
                  <ProductCard key={prod.id} prod={prod} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
