'use client'

import { useState } from 'react'
import type { ImagenProducto } from '@/lib/types'

interface Props {
  imagenes: ImagenProducto[]
  nombre: string
}

export default function GaleriaImagenes({ imagenes, nombre }: Props) {
  const [activa, setActiva] = useState(0)

  if (imagenes.length === 0) {
    return (
      <div className="aspect-[3/4] bg-stone-100 flex items-center justify-center">
        <span className="material-symbols-outlined text-stone-300 text-8xl">deployed_code</span>
      </div>
    )
  }

  return (
    <div className="flex gap-4">
      {/* Thumbnails */}
      {imagenes.length > 1 && (
        <div className="flex flex-col gap-2 w-16 shrink-0">
          {imagenes.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiva(i)}
              className={`aspect-square overflow-hidden border-2 transition-colors ${
                activa === i ? 'border-stone-900' : 'border-transparent'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt || nombre} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Imagen principal */}
      <div className="flex-1 aspect-[3/4] overflow-hidden bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imagenes[activa].url}
          alt={imagenes[activa].alt || nombre}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}
