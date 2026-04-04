import { Link } from 'next-view-transitions'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import ProductCarousel from '@/components/store/ProductCarousel'
import type { Producto } from '@/lib/types'

const HERO_IMG = '/hero-fashion.jpg'

const GENERO_CARDS = [
  { label: 'Mujer', genero: 'mujer', img: '/mujer.jpg' },
  { label: 'Hombre', genero: 'hombre', img: '/hombre.jpg' },
]

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: productos }, { data: destacados }] = await Promise.all([
    supabase.from('productos').select('*, categorias(nombre)').eq('activo', true).order('orden', { ascending: true }).order('created_at', { ascending: false }).limit(12),
    supabase.from('productos').select('*, categorias(nombre)').eq('activo', true).eq('destacado', true).order('orden', { ascending: true }).order('created_at', { ascending: false }).limit(12),
  ])

  const prods: Producto[] = productos ?? []
  const idsDestacados = new Set((destacados ?? []).map(p => p.id))
  const resto = prods.filter(p => !idsDestacados.has(p.id))
  const propsDestacados: Producto[] = [...(destacados ?? []), ...resto]

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <section className="relative min-h-[90vh] flex items-end overflow-hidden bg-stone-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HERO_IMG} alt="Nueva Colección" className="absolute inset-0 w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-linear-to-t from-stone-900/55 via-stone-900/10 to-transparent" />
          <div className="relative z-10 px-8 lg:px-16 pb-16 lg:pb-24">
            <span className="text-xs uppercase tracking-widest text-white/60 mb-3 block" style={{ fontFamily: 'var(--font-manrope)' }}>
              Nueva Colección
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl text-white leading-[1.05] tracking-tight mb-8" style={{ fontFamily: 'var(--font-noto-serif)' }}>
              Otoño Invierno<br />2026
            </h1>
            <Link
              href="/tienda"
              className="inline-block bg-white text-stone-900 px-8 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-stone-900 hover:text-white transition-all duration-300"
              style={{ fontFamily: 'var(--font-manrope)' }}
            >
              Ver Colección
            </Link>
          </div>
        </section>

        {/* ── Destacados ── */}
        <section id="nuevos-ingresos" className="py-24 px-8 bg-[#f5f2ed]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 md:mb-12">
              {/* Desktop: título y "Ver todo" en la misma fila */}
              <div className="hidden md:flex justify-between items-end">
                <div>
                  <span className="text-xs uppercase tracking-[0.3em] text-stone-400 mb-2 block" style={{ fontFamily: 'var(--font-manrope)' }}>
                    Selección
                  </span>
                  <h2 className="text-3xl md:text-4xl text-stone-900 font-medium" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                    Lo más nuevo
                  </h2>
                </div>
                <Link
                  href="/tienda"
                  className="text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors border-b border-stone-400 hover:border-stone-900 pb-0.5"
                  style={{ fontFamily: 'var(--font-manrope)' }}
                >
                  Ver todo
                </Link>
              </div>
              {/* Mobile: título arriba, "Ver todo" debajo */}
              <div className="md:hidden">
                <span className="text-xs uppercase tracking-[0.3em] text-stone-400 mb-2 block" style={{ fontFamily: 'var(--font-manrope)' }}>
                  Selección
                </span>
                <h2 className="text-3xl text-stone-900 font-medium mb-3" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                  Lo más nuevo
                </h2>
                <Link
                  href="/tienda"
                  className="text-xs uppercase tracking-widest text-stone-500 border-b border-stone-400 pb-0.5"
                  style={{ fontFamily: 'var(--font-manrope)' }}
                >
                  Ver todo
                </Link>
              </div>
            </div>

            {propsDestacados.length === 0 ? (
              <p className="text-center text-stone-400 py-20">Pronto habrá productos disponibles.</p>
            ) : (
              <ProductCarousel productos={propsDestacados} />
            )}
          </div>
        </section>

        {/* ── Mujer / Hombre ── */}
        <section className="py-24 px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {GENERO_CARDS.map((card) => (
                <Link
                  key={card.genero}
                  href={`/tienda?genero=${card.genero}`}
                  className="group relative aspect-[4/3] overflow-hidden bg-stone-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.img}
                    alt={card.label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-stone-900/20 group-hover:bg-stone-900/40 transition-colors duration-500 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/70 mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>
                      Colección Otoño
                    </span>
                    <h3 className="text-5xl text-white tracking-tight font-normal" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                      {card.label}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
