import Image from 'next/image'
import Link from 'next/link'
import Reveal from '@/components/store/Reveal'
import hero from '@/public/hero-fashion.jpg'
import hombre from '@/public/hombre.jpg'
import mujer from '@/public/mujer.jpg'

export const metadata = {
  title: 'Nosotros',
  description: 'Conoce la historia y filosofía detrás de ATELIER, moda contemporánea con esencia atemporal.',
}

const PILARES = [
  {
    numero: '01',
    titulo: 'Diseño',
    texto:
      'Cada prenda nace de un proceso de diseño consciente. Líneas limpias, proporciones estudiadas y detalles que perduran más allá de las temporadas.',
  },
  {
    numero: '02',
    titulo: 'Calidad',
    texto:
      'Seleccionamos materiales que se sienten bien y duran. Porque la ropa que vale la pena no se descarta — se atesora.',
  },
  {
    numero: '03',
    titulo: 'Atemporalidad',
    texto:
      'No seguimos tendencias, construimos guardarropas. Piezas que funcionan hoy, mañana y dentro de diez años.',
  },
]

export default function NosotrosPage() {
  return (
    <div className="flex-1">
      {/* ── Hero ── */}
      <section className="relative h-[70vh] overflow-hidden bg-stone-100 md:h-[85vh]">
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
        <div className="absolute bottom-0 left-0 px-6 pb-14 md:px-8 lg:px-16 lg:pb-20">
          <Reveal modo="carga" delay={200}>
            <span className="mb-3 block text-xs tracking-[0.3em] text-white/80 uppercase">
              Nuestra historia
            </span>
            <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-white md:text-7xl">
              Moda que
              <br />
              dura lo que importa
            </h1>
          </Reveal>
        </div>
      </section>

      {/* ── Manifiesto ── */}
      <section className="bg-white px-6 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="mb-6 block text-xs tracking-[0.3em] text-stone-500 uppercase">ATELIER</span>
            <p className="font-serif text-2xl leading-relaxed font-light text-stone-900 md:text-3xl">
              Creemos que vestirse bien no es cuestión de tendencias. Es saber quién eres y encontrar prendas
              que lo digan sin esfuerzo.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Historia — split ── */}
      <section className="bg-[#f5f2ed]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-2">
          {/* Imagen */}
          <Reveal
            direction="left"
            className="relative aspect-4/5 overflow-hidden md:aspect-auto md:min-h-[32rem]"
          >
            <Image
              src={mujer}
              alt="Colección ATELIER"
              fill
              placeholder="blur"
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </Reveal>
          {/* Texto */}
          <div className="flex items-center px-6 py-16 md:px-8 md:px-16 lg:px-20">
            <Reveal direction="right" className="max-w-md">
              <span className="mb-6 block text-xs tracking-[0.3em] text-stone-500 uppercase">Origen</span>
              <h2 className="mb-8 font-serif text-3xl leading-snug text-stone-900 md:text-4xl">
                Nacimos en Lima con una idea simple
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-stone-500">
                <p>
                  ATELIER nació de la frustración de no encontrar ropa que combine bien sin tener que elegir
                  entre estilo y comodidad. Ropa que se vea de verdad, no solo en fotos.
                </p>
                <p>
                  Empezamos con pocas piezas, mucha atención al detalle y la convicción de que Lima merece una
                  marca de moda que entienda cómo vivimos: activos, versátiles, con criterio propio.
                </p>
                <p>Hoy cada colección sigue siendo pequeña, intencional y hecha para durar.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Pilares ── */}
      <section className="bg-white px-6 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <span className="mb-16 block text-xs tracking-[0.3em] text-stone-500 uppercase">
              Lo que nos define
            </span>
          </Reveal>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
            {PILARES.map((pilar, i) => (
              <Reveal key={pilar.numero} delay={i * 150}>
                <p className="mb-4 font-mono text-xs text-stone-300">{pilar.numero}</p>
                <h3 className="mb-4 font-serif text-xl text-stone-900">{pilar.titulo}</h3>
                <div className="mb-4 w-8 border-t border-stone-200" />
                <p className="text-sm leading-relaxed text-stone-500">{pilar.texto}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Visión — split inverso ── */}
      <section className="bg-[#f5f2ed]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-2">
          {/* Texto */}
          <div className="order-2 flex items-center px-6 py-16 md:order-1 md:px-8 md:px-16 lg:px-20">
            <Reveal direction="left" className="max-w-md">
              <span className="mb-6 block text-xs tracking-[0.3em] text-stone-500 uppercase">Para todos</span>
              <h2 className="mb-8 font-serif text-3xl leading-snug text-stone-900 md:text-4xl">
                Moda sin género obligado
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-stone-500">
                <p>
                  Diseñamos para personas, no para estereotipos. Nuestra colección incluye piezas para mujer,
                  hombre y estilos unisex porque el buen gusto no tiene una sola forma.
                </p>
                <p>
                  Cada prenda está pensada para adaptarse a distintos cuerpos, ocasiones y actitudes. Elegante
                  cuando lo necesitas, relajado cuando quieres.
                </p>
              </div>
            </Reveal>
          </div>
          {/* Imagen */}
          <Reveal
            direction="right"
            className="relative order-1 aspect-4/5 overflow-hidden md:order-2 md:aspect-auto md:min-h-[32rem]"
          >
            <Image
              src={hombre}
              alt="Colección ATELIER Hombre"
              fill
              placeholder="blur"
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </Reveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-stone-900 px-6 py-20 text-center md:px-8 md:py-28">
        <Reveal>
          <span className="mb-6 block text-xs tracking-[0.3em] text-white/70 uppercase">
            Colección actual
          </span>
          <h2 className="mb-10 font-serif text-3xl font-light text-white md:text-4xl">
            Descubre las piezas de esta temporada
          </h2>
          <Link
            href="/tienda"
            className="inline-block border border-white px-10 py-4 text-xs tracking-widest text-white uppercase transition-all duration-300 hover:bg-white hover:text-stone-900"
          >
            Ver colección
          </Link>
        </Reveal>
      </section>
    </div>
  )
}
