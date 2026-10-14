import { Link } from 'next-view-transitions'
import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import Reveal from '@/components/store/Reveal'

export const metadata = {
  title: 'Nosotros — Atelier',
  description: 'Conoce la historia y filosofía detrás de ATELIER, moda contemporánea con esencia atemporal.',
}

const PILARES = [
  {
    numero: '01',
    titulo: 'Diseño',
    texto: 'Cada prenda nace de un proceso de diseño consciente. Líneas limpias, proporciones estudiadas y detalles que perduran más allá de las temporadas.',
  },
  {
    numero: '02',
    titulo: 'Calidad',
    texto: 'Seleccionamos materiales que se sienten bien y duran. Porque la ropa que vale la pena no se descarta — se atesora.',
  },
  {
    numero: '03',
    titulo: 'Atemporalidad',
    texto: 'No seguimos tendencias, construimos guardarropas. Piezas que funcionan hoy, mañana y dentro de diez años.',
  },
]

export default function NosotrosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative h-[70vh] md:h-[85vh] overflow-hidden bg-stone-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-fashion.jpg"
            alt="ATELIER"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-linear-to-t from-stone-900/60 via-stone-900/10 to-transparent" />
          <div className="absolute bottom-0 left-0 px-8 lg:px-16 pb-14 lg:pb-20">
            <Reveal delay={200}>
              <span className="text-xs uppercase tracking-[0.3em] text-white/50 mb-3 block" style={{ fontFamily: 'var(--font-manrope)' }}>
                Nuestra historia
              </span>
              <h1 className="text-5xl md:text-7xl text-white leading-[1.05] tracking-tight" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                Moda que<br />dura lo que importa
              </h1>
            </Reveal>
          </div>
        </section>

        {/* ── Manifiesto ── */}
        <section className="bg-white py-20 md:py-28 px-8">
          <div className="max-w-2xl mx-auto text-center">
            <Reveal>
              <span className="text-xs uppercase tracking-[0.3em] text-stone-400 mb-6 block" style={{ fontFamily: 'var(--font-manrope)' }}>
                ATELIER
              </span>
              <p className="text-2xl md:text-3xl text-stone-900 leading-relaxed font-light" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                Creemos que vestirse bien no es cuestión de tendencias. Es saber quién eres y encontrar prendas que lo digan sin esfuerzo.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Historia — split ── */}
        <section className="bg-[#f5f2ed]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2">
            {/* Imagen */}
            <Reveal direction="left" className="aspect-[4/5] md:aspect-auto overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/mujer.jpg"
                alt="Colección ATELIER"
                className="w-full h-full object-cover"
              />
            </Reveal>
            {/* Texto */}
            <div className="flex items-center px-8 py-16 md:px-16 lg:px-20">
              <Reveal direction="right" className="max-w-md">
                <span className="text-xs uppercase tracking-[0.3em] text-stone-400 mb-6 block" style={{ fontFamily: 'var(--font-manrope)' }}>
                  Origen
                </span>
                <h2 className="text-3xl md:text-4xl text-stone-900 mb-8 leading-snug" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                  Nacimos en Lima con una idea simple
                </h2>
                <div className="space-y-4 text-sm text-stone-500 leading-relaxed" style={{ fontFamily: 'var(--font-manrope)' }}>
                  <p>
                    ATELIER nació de la frustración de no encontrar ropa que combine bien sin tener que elegir entre estilo y comodidad. Ropa que se vea de verdad, no solo en fotos.
                  </p>
                  <p>
                    Empezamos con pocas piezas, mucha atención al detalle y la convicción de que Lima merece una marca de moda que entienda cómo vivimos: activos, versátiles, con criterio propio.
                  </p>
                  <p>
                    Hoy cada colección sigue siendo pequeña, intencional y hecha para durar.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Pilares ── */}
        <section className="bg-white py-20 md:py-28 px-8">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <span className="text-xs uppercase tracking-[0.3em] text-stone-400 mb-16 block" style={{ fontFamily: 'var(--font-manrope)' }}>
                Lo que nos define
              </span>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
              {PILARES.map((pilar, i) => (
                <Reveal key={pilar.numero} delay={i * 150}>
                  <p className="text-xs text-stone-300 mb-4 font-mono">{pilar.numero}</p>
                  <h3 className="text-xl text-stone-900 mb-4" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                    {pilar.titulo}
                  </h3>
                  <div className="w-8 border-t border-stone-200 mb-4" />
                  <p className="text-sm text-stone-500 leading-relaxed" style={{ fontFamily: 'var(--font-manrope)' }}>
                    {pilar.texto}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Visión — split inverso ── */}
        <section className="bg-[#f5f2ed]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2">
            {/* Texto */}
            <div className="flex items-center px-8 py-16 md:px-16 lg:px-20 order-2 md:order-1">
              <Reveal direction="left" className="max-w-md">
                <span className="text-xs uppercase tracking-[0.3em] text-stone-400 mb-6 block" style={{ fontFamily: 'var(--font-manrope)' }}>
                  Para todos
                </span>
                <h2 className="text-3xl md:text-4xl text-stone-900 mb-8 leading-snug" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                  Moda sin género obligado
                </h2>
                <div className="space-y-4 text-sm text-stone-500 leading-relaxed" style={{ fontFamily: 'var(--font-manrope)' }}>
                  <p>
                    Diseñamos para personas, no para estereotipos. Nuestra colección incluye piezas para mujer, hombre y estilos unisex porque el buen gusto no tiene una sola forma.
                  </p>
                  <p>
                    Cada prenda está pensada para adaptarse a distintos cuerpos, ocasiones y actitudes. Elegante cuando lo necesitas, relajado cuando quieres.
                  </p>
                </div>
              </Reveal>
            </div>
            {/* Imagen */}
            <Reveal direction="right" className="aspect-[4/5] md:aspect-auto overflow-hidden order-1 md:order-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hombre.jpg"
                alt="Colección ATELIER Hombre"
                className="w-full h-full object-cover"
              />
            </Reveal>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-stone-900 py-20 md:py-28 px-8 text-center">
          <Reveal>
            <span className="text-xs uppercase tracking-[0.3em] text-white/40 mb-6 block" style={{ fontFamily: 'var(--font-manrope)' }}>
              Colección actual
            </span>
            <h2 className="text-3xl md:text-4xl text-white mb-10 font-light" style={{ fontFamily: 'var(--font-noto-serif)' }}>
              Descubre las piezas de esta temporada
            </h2>
            <Link
              href="/tienda"
              className="inline-block border border-white text-white px-10 py-4 text-xs uppercase tracking-widest hover:bg-white hover:text-stone-900 transition-all duration-300"
              style={{ fontFamily: 'var(--font-manrope)' }}
            >
              Ver colección
            </Link>
          </Reveal>
        </section>

      </main>
      <Footer />
    </div>
  )
}
