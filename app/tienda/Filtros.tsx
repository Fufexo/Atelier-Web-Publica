'use client'

import { useRouter, useSearchParams } from 'next/navigation'
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
  const router = useRouter()
  const params = useSearchParams()

  const generoActivo = params.get('genero') ?? ''
  const catActiva = params.get('categoria') ?? ''
  const novedadActiva = params.get('novedad') === 'true'

  function navegar(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    // Novedades y categoría son mutuamente excluyentes
    if (key === 'novedad' && value) next.delete('categoria')
    if (key === 'categoria' && value) next.delete('novedad')
    router.push(`/tienda?${next.toString()}`)
  }

  function limpiar() {
    router.push('/tienda')
  }

  const hayFiltros = generoActivo || catActiva || novedadActiva

  return (
    <div className="border-b border-stone-200 bg-white">
      <div className="max-w-7xl mx-auto px-8 py-4 flex flex-wrap items-center gap-6">

        {/* Género */}
        <div className="flex items-center gap-2">
          {GENEROS.map((g) => (
            <button
              key={g.value}
              onClick={() => navegar('genero', g.value)}
              className={`text-xs uppercase tracking-widest px-4 py-2 transition-colors ${
                generoActivo === g.value
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
              }`}
              style={{ fontFamily: 'var(--font-manrope)' }}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Separador + Categorías (ocultos en modo Novedades) */}
        {!novedadActiva && (
          <>
            <div className="w-px h-5 bg-stone-200" />
            <div className="flex items-center gap-2 flex-wrap">
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navegar('categoria', catActiva === cat.slug ? '' : cat.slug)}
                  className={`text-xs uppercase tracking-widest px-4 py-2 transition-colors ${
                    catActiva === cat.slug
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
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
          onClick={() => navegar('novedad', novedadActiva ? '' : 'true')}
          className={`text-xs uppercase tracking-widest px-4 py-2 transition-colors ${
            novedadActiva
              ? 'bg-stone-900 text-white'
              : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
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
