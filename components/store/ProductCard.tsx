import Image from 'next/image'
import Link from 'next/link'
import { ViewTransition } from 'react'
import Icon from '@/components/ui/Icon'
import { formatearPrecio } from '@/lib/format'
import { precioFinal } from '@/lib/precios'
import type { ProductoResumen } from '@/lib/types'

interface Props {
  prod: ProductoResumen
  /** Animación de hover (zoom y CTA). Se apaga en carruseles táctiles. */
  hover?: boolean
  /** Para la primera fila visible: carga la imagen sin lazy-load. */
  prioridad?: boolean
}

/** Card de producto. Usarla siempre en vez de maquetar una card a mano. */
export default function ProductCard({ prod, hover = true, prioridad = false }: Props) {
  const imagen = prod.imagenes[0]

  return (
    <article className="group relative">
      <div className="bg-lino relative mb-4 aspect-3/4 overflow-hidden">
        {imagen ? (
          // Mismo nombre que la imagen de la ficha: React la "mueve" al navegar.
          <ViewTransition name={`producto-${prod.slug}`}>
            <Image
              src={imagen.url}
              alt={imagen.alt || prod.nombre}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
              loading={prioridad ? 'eager' : 'lazy'}
              className={`object-cover ${hover ? 'transition-transform duration-500 group-hover:scale-105' : ''}`}
            />
          </ViewTransition>
        ) : (
          <div className="flex h-full items-center justify-center text-stone-300">
            <Icon name="imagen" className="size-14" />
          </div>
        )}

        {prod.precio_oferta !== null && (
          <span className="absolute top-3 left-3 bg-stone-900 px-2 py-1 text-[10px] tracking-widest text-white uppercase">
            Oferta
          </span>
        )}

        {hover && (
          <span
            aria-hidden
            className="absolute right-4 bottom-4 left-4 translate-y-2 bg-stone-900 py-3 text-center text-xs tracking-[0.14em] text-white uppercase opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            Ver producto
          </span>
        )}
      </div>

      {prod.categoria && (
        <p className="mb-1 truncate text-[11px] tracking-widest text-stone-600 uppercase">{prod.categoria}</p>
      )}
      <h3 className="mb-1 text-sm leading-5 font-medium text-stone-900">
        {/* El enlace cubre toda la card (::after) pero hay un solo destino para teclado y lectores. */}
        <Link
          href={`/producto/${prod.slug}`}
          className={`after:absolute after:inset-0 ${hover ? 'underline-offset-2 group-hover:underline' : ''}`}
        >
          {prod.nombre}
        </Link>
      </h3>
      <p className="flex items-center gap-2 text-sm text-stone-600">
        <span>{formatearPrecio(precioFinal(prod))}</span>
        {prod.precio_oferta !== null && (
          <span className="text-xs text-stone-600 line-through">
            <span className="sr-only">Antes </span>
            {formatearPrecio(prod.precio)}
          </span>
        )}
      </p>
    </article>
  )
}
