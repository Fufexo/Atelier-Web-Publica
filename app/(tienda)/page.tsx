import Image from 'next/image'
import Link from 'next/link'
import ProductGrid from '@/components/store/ProductGrid'
import Reveal from '@/components/store/Reveal'
import { boton } from '@/components/ui/button'
import { getProductosPortada } from '@/lib/catalogo'
import hero from '@/public/hero-fashion.jpg'
import hombre from '@/public/hombre.jpg'
import mujer from '@/public/mujer.jpg'

const GENERO_CARDS = [
  { label: 'Mujer', genero: 'mujer', img: mujer },
  { label: 'Hombre', genero: 'hombre', img: hombre },
]

export default async function HomePage() {
  const productos = await getProductosPortada()

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative flex min-h-[90vh] items-end overflow-hidden bg-stone-100">
        <Image
          src={hero}
          alt=""
          fill
          preload
          placeholder="blur"
          sizes="100vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-linear-to-t from-stone-900/60 via-stone-900/10 to-transparent" />
        <Reveal modo="carga" delay={150} className="relative z-10 px-6 pb-16 md:px-8 lg:px-16 lg:pb-24">
          <p className="mb-3 text-xs tracking-widest text-white/80 uppercase">Nueva colección</p>
          <h1 className="mb-8 font-serif text-5xl leading-[1.05] tracking-tight text-white md:text-7xl lg:text-8xl">
            Otoño Invierno
            <br />
            2026
          </h1>
          <Link href="/tienda" className={boton({ variante: 'claro' })}>
            Ver colección
          </Link>
        </Reveal>
      </section>

      {/* ── Lo más nuevo ── */}
      <section aria-labelledby="titulo-nuevos" className="bg-crema px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-8 flex flex-col gap-3 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs tracking-[0.3em] text-stone-500 uppercase">Selección</p>
              <h2 id="titulo-nuevos" className="font-serif text-3xl font-medium text-stone-900 md:text-4xl">
                Lo más nuevo
              </h2>
            </div>
            <Link
              href="/tienda"
              className={boton({ variante: 'enlace', className: 'self-start md:self-auto' })}
            >
              Ver todo
            </Link>
          </Reveal>

          {productos.length === 0 ? (
            <p className="py-20 text-center text-stone-500">Pronto habrá productos disponibles.</p>
          ) : (
            <ProductGrid productos={productos} />
          )}
        </div>
      </section>

      {/* ── Mujer / Hombre ── */}
      <section aria-label="Colecciones" className="bg-white px-6 py-24 md:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2">
          {GENERO_CARDS.map((card, i) => (
            <Reveal key={card.genero} direction={i === 0 ? 'left' : 'right'}>
              <Link
                href={`/tienda?genero=${card.genero}`}
                className="group relative block aspect-4/3 overflow-hidden bg-stone-100"
              >
                <Image
                  src={card.img}
                  alt=""
                  fill
                  placeholder="blur"
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900/25 text-center transition-colors duration-500 group-hover:bg-stone-900/40">
                  <span className="mb-2 text-[10px] tracking-[0.2em] text-white/80 uppercase">
                    Colección otoño
                  </span>
                  <span className="font-serif text-5xl font-normal tracking-tight text-white">
                    {card.label}
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
