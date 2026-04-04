import { Suspense } from 'react'
import { Link } from 'next-view-transitions'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import Filtros from './Filtros'
import { formatearPrecio } from '@/lib/utils'
import type { Producto, Categoria, ImagenProducto } from '@/lib/types'

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
              {/* Mobile: carrusel 1 producto centrado con snap */}
              <div className="md:hidden -mx-8 overflow-x-auto snap-x snap-mandatory flex pb-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {productos.map((prod) => {
                  const imagen = (prod.imagenes as ImagenProducto[])?.[0]
                  const precioMostrar = prod.precio_oferta ?? prod.precio
                  const catNombre = (prod.categorias as { nombre: string } | null)?.nombre ?? ''
                  return (
                    <div key={prod.id} className="snap-center shrink-0 w-full px-8">
                      <Link href={`/producto/${prod.slug}`} className="group block">
                        <div className="relative aspect-3/4 bg-stone-200 overflow-hidden mb-3">
                          {imagen ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={imagen.url}
                              alt={imagen.alt || prod.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300">
                              <span className="material-symbols-outlined text-6xl">deployed_code</span>
                            </div>
                          )}
                          {prod.precio_oferta && (
                            <span className="absolute top-3 left-3 bg-stone-900 text-white text-[10px] uppercase tracking-widest px-2 py-1" style={{ fontFamily: 'var(--font-manrope)' }}>
                              Oferta
                            </span>
                          )}
                        </div>
                        {catNombre && (
                          <p className="text-[11px] uppercase tracking-widest text-stone-400 mb-1" style={{ fontFamily: 'var(--font-manrope)' }}>
                            {catNombre}
                          </p>
                        )}
                        <h3 className="text-sm font-medium text-stone-900 mb-1 leading-5" style={{ fontFamily: 'var(--font-manrope)' }}>
                          {prod.nombre}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-stone-600" style={{ fontFamily: 'var(--font-manrope)' }}>{formatearPrecio(precioMostrar)}</span>
                          {prod.precio_oferta && (
                            <span className="text-xs text-stone-400 line-through" style={{ fontFamily: 'var(--font-manrope)' }}>{formatearPrecio(prod.precio)}</span>
                          )}
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>

              {/* Tablet+: grid normal */}
              <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                {productos.map((prod) => {
                  const imagen = (prod.imagenes as ImagenProducto[])?.[0]
                  const precioMostrar = prod.precio_oferta ?? prod.precio
                  const catNombre = (prod.categorias as { nombre: string } | null)?.nombre ?? ''
                  return (
                    <Link key={prod.id} href={`/producto/${prod.slug}`} className="group">
                      <div className="relative aspect-3/4 bg-stone-200 overflow-hidden mb-4">
                        {imagen ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imagen.url}
                            alt={imagen.alt || prod.nombre}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-300">
                            <span className="material-symbols-outlined text-6xl">deployed_code</span>
                          </div>
                        )}
                        {prod.precio_oferta && (
                          <span className="absolute top-3 left-3 bg-stone-900 text-white text-[10px] uppercase tracking-widest px-2 py-1" style={{ fontFamily: 'var(--font-manrope)' }}>
                            Oferta
                          </span>
                        )}
                      </div>
                      {catNombre && (
                        <p className="text-[11px] uppercase tracking-widest text-stone-400 mb-1" style={{ fontFamily: 'var(--font-manrope)' }}>
                          {catNombre}
                        </p>
                      )}
                      <h3 className="text-sm font-medium text-stone-900 mb-1 leading-5 group-hover:underline underline-offset-2" style={{ fontFamily: 'var(--font-manrope)' }}>
                        {prod.nombre}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-stone-600" style={{ fontFamily: 'var(--font-manrope)' }}>{formatearPrecio(precioMostrar)}</span>
                        {prod.precio_oferta && (
                          <span className="text-xs text-stone-400 line-through" style={{ fontFamily: 'var(--font-manrope)' }}>{formatearPrecio(prod.precio)}</span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
