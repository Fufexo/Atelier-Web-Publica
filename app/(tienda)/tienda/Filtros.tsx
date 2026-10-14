'use client'

import { useTransitionRouter } from 'next-view-transitions'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
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
  const busquedaActiva = params.get('q') ?? ''

  const [localGenero, setLocalGenero] = useState(generoActivo)
  const [localCat, setLocalCat] = useState(catActiva)
  const [localNovedad, setLocalNovedad] = useState(novedadActiva)
  const [localBusqueda, setLocalBusqueda] = useState(busquedaActiva)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLocalGenero(generoActivo)
    setLocalCat(catActiva)
    setLocalNovedad(novedadActiva)
    setLocalBusqueda(busquedaActiva)
  }, [generoActivo, catActiva, novedadActiva, busquedaActiva])

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
    setLocalBusqueda('')
    router.push('/tienda')
  }

  function handleBusqueda(valor: string) {
    setLocalBusqueda(valor)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const next = new URLSearchParams(params.toString())
      if (valor.trim()) next.set('q', valor.trim())
      else next.delete('q')
      router.push(`/tienda?${next.toString()}`)
    }, 400)
  }

  const hayFiltros = localGenero || localCat || localNovedad || localBusqueda

  const btnClass = (activo: boolean) =>
    `cursor-pointer shrink-0 text-xs uppercase tracking-widest px-4 py-2 rounded-sm transition-colors duration-150 ${
      activo ? 'bg-stone-900 text-white' : 'text-stone-400 hover:text-stone-900'
    }`

  return (
    <div className="border-b border-stone-200 bg-white">
      <div className="max-w-7xl mx-auto flex items-center gap-3 px-4 md:px-8 py-3">

        {/* Filtros: scroll horizontal, nunca rompen */}
        <div className="flex-1 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="flex items-center gap-1 min-w-max">
            {GENEROS.map((g) => (
              <button
                key={g.value}
                onClick={() => navegar('genero', g.value)}
                className={btnClass(localGenero === g.value)}
                style={{ fontFamily: 'var(--font-manrope)' }}
              >
                {g.label}
              </button>
            ))}

            {!localNovedad && (
              <>
                <div className="w-px h-5 bg-stone-200 mx-2 shrink-0" />
                {categorias.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => navegar('categoria', localCat === cat.slug ? '' : cat.slug)}
                    className={btnClass(localCat === cat.slug)}
                    style={{ fontFamily: 'var(--font-manrope)' }}
                  >
                    {cat.nombre}
                  </button>
                ))}
              </>
            )}

            <div className="w-px h-5 bg-stone-200 mx-2 shrink-0" />

            <button
              onClick={() => navegar('novedad', localNovedad ? '' : 'true')}
              className={btnClass(localNovedad)}
              style={{ fontFamily: 'var(--font-manrope)' }}
            >
              Novedades
            </button>
          </div>
        </div>

        {/* Búsqueda + Limpiar: siempre fijos a la derecha */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <input
              type="text"
              value={localBusqueda}
              onChange={(e) => handleBusqueda(e.target.value)}
              placeholder="Buscar..."
              className="w-32 md:w-44 border border-stone-200 bg-transparent pl-8 pr-3 py-1.5 text-xs text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-500 transition-colors"
              style={{ fontFamily: 'var(--font-manrope)' }}
            />
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-300 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </div>
          {hayFiltros && (
            <button
              onClick={limpiar}
              className="cursor-pointer text-xs text-stone-400 hover:text-stone-700 underline underline-offset-4 transition-colors"
              style={{ fontFamily: 'var(--font-manrope)' }}
            >
              Limpiar
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
