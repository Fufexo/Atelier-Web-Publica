'use client'

import { useTransitionRouter } from 'next-view-transitions'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import type { Categoria } from '@/lib/types'

interface Props {
  categorias: Categoria[]
}

const GENEROS = [
  { value: '', label: 'Todo' },
  { value: 'mujer', label: 'Mujer' },
  { value: 'hombre', label: 'Hombre' },
  { value: 'unisex', label: 'Unisex' },
]

export default function Filtros({ categorias }: Props) {
  const router = useTransitionRouter()
  const params = useSearchParams()

  const generoActivo = params.get('genero') ?? ''
  const catActiva = params.get('categoria') ?? ''
  const novedadActiva = params.get('novedad') === 'true'

  // Estado local para feedback inmediato
  const [localGenero, setLocalGenero] = useState(generoActivo)
  const [localCat, setLocalCat] = useState(catActiva)
  const [localNovedad, setLocalNovedad] = useState(novedadActiva)

  useEffect(() => {
    setLocalGenero(generoActivo)
    setLocalCat(catActiva)
    setLocalNovedad(novedadActiva)
  }, [generoActivo, catActiva, novedadActiva])

  function navegar(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    if (key === 'novedad' && value) next.delete('categoria')
    if (key === 'categoria' && value) next.delete('novedad')

    if (key === 'genero') setLocalGenero(value)
    if (key === 'categoria') { setLocalCat(value); setLocalNovedad(false) }
    if (key === 'novedad') { setLocalNovedad(value === 'true'); setLocalCat('') }

    router.push(`/tienda?${next.toString()}`)
  }

  function limpiar() {
    setLocalGenero('')
    setLocalCat('')
    setLocalNovedad(false)
    router.push('/tienda')
  }

  const hayFiltros = localGenero || localCat || localNovedad

  return (
    <div className="border-b border-stone-200 bg-white">
      <div className="max-w-7xl mx-auto px-8 py-4 flex flex-wrap items-center gap-6">

        {/* Género */}
        <div className="flex items-center">
          {GENEROS.map((g) => (
            <button
              key={g.value}
              onClick={() => navegar('genero', g.value)}
              className={`text-xs uppercase tracking-widest px-4 py-2 rounded-sm transition-colors duration-150 ${
                localGenero === g.value
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-400 hover:text-stone-900'
              }`}
              style={{ fontFamily: 'var(--font-manrope)' }}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Categorías */}
        {!localNovedad && (
          <>
            <div className="w-px h-5 bg-stone-200" />
            <div className="flex items-center gap-2 flex-wrap">
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navegar('categoria', localCat === cat.slug ? '' : cat.slug)}
                  className={`text-xs uppercase tracking-widest px-4 py-2 rounded-sm transition-colors duration-150 ${
                    localCat === cat.slug
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-400 hover:text-stone-900'
                  }`}
                  style={{ fontFamily: 'var(--font-manrope)' }}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Novedad */}
        <button
          onClick={() => navegar('novedad', localNovedad ? '' : 'true')}
          className={`text-xs uppercase tracking-widest px-4 py-2 rounded-sm transition-colors duration-150 ${
            localNovedad
              ? 'bg-stone-900 text-white'
              : 'text-stone-400 hover:text-stone-900'
          }`}
          style={{ fontFamily: 'var(--font-manrope)' }}
        >
          Novedades
        </button>

        {/* Limpiar */}
        {hayFiltros && (
          <button
            onClick={limpiar}
            className="ml-auto text-xs text-stone-400 hover:text-stone-700 underline underline-offset-4 transition-colors"
            style={{ fontFamily: 'var(--font-manrope)' }}
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  )
}
