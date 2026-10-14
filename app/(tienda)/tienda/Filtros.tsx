'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useOptimistic, useRef, useTransition } from 'react'
import Icon from '@/components/ui/Icon'
import type { Categoria } from '@/lib/types'

const GENEROS = [
  { value: '', label: 'Todo' },
  { value: 'mujer', label: 'Mujer' },
  { value: 'hombre', label: 'Hombre' },
  { value: 'unisex', label: 'Unisex' },
]

type Clave = 'genero' | 'categoria' | 'novedad' | 'q'

/**
 * Los filtros viven en la URL (compartible, funciona con atrás/adelante).
 * `useOptimistic` marca el botón al instante mientras el servidor trae los productos.
 */
export default function Filtros({ categorias }: { categorias: Categoria[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [cargando, startTransition] = useTransition()
  const [optimistas, setOptimistas] = useOptimistic(params.toString())
  const actuales = new URLSearchParams(optimistas)
  const busqueda = useRef<HTMLInputElement>(null)
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined)

  const genero = actuales.get('genero') ?? ''
  const categoria = actuales.get('categoria') ?? ''
  const novedad = actuales.get('novedad') === 'true'
  const hayFiltros = [...actuales.keys()].length > 0

  function navegar(cambios: Partial<Record<Clave, string>>) {
    const siguiente = new URLSearchParams(params.toString())
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor) siguiente.set(clave, valor)
      else siguiente.delete(clave)
    }
    // Novedades y categoría son excluyentes.
    if (cambios.novedad) siguiente.delete('categoria')
    if (cambios.categoria) siguiente.delete('novedad')

    const query = siguiente.toString()
    startTransition(() => {
      setOptimistas(query)
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
    })
  }

  function buscar(valor: string) {
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => navegar({ q: valor.trim() }), 400)
  }

  function limpiar() {
    clearTimeout(debounce.current)
    if (busqueda.current) busqueda.current.value = ''
    startTransition(() => {
      setOptimistas('')
      router.push(pathname, { scroll: false })
    })
  }

  const chip = (activo: boolean) =>
    `min-h-9 shrink-0 cursor-pointer rounded-sm px-4 py-2 text-xs tracking-widest uppercase transition-colors duration-150 ${
      activo ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-900'
    }`

  return (
    <div className="border-b border-stone-200 bg-white" aria-busy={cargando}>
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-8">
        <div className="flex-1 scrollbar-none overflow-x-auto">
          <div className="flex min-w-max items-center gap-1" role="group" aria-label="Filtrar productos">
            {GENEROS.map((g) => (
              <button
                key={g.value}
                type="button"
                aria-pressed={genero === g.value}
                onClick={() => navegar({ genero: g.value })}
                className={chip(genero === g.value)}
              >
                {g.label}
              </button>
            ))}

            {!novedad && categorias.length > 0 && (
              <>
                <span aria-hidden className="mx-2 h-5 w-px shrink-0 bg-stone-200" />
                {categorias.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    aria-pressed={categoria === cat.slug}
                    onClick={() => navegar({ categoria: categoria === cat.slug ? '' : cat.slug })}
                    className={chip(categoria === cat.slug)}
                  >
                    {cat.nombre}
                  </button>
                ))}
              </>
            )}

            <span aria-hidden className="mx-2 h-5 w-px shrink-0 bg-stone-200" />
            <button
              type="button"
              aria-pressed={novedad}
              onClick={() => navegar({ novedad: novedad ? '' : 'true' })}
              className={chip(novedad)}
            >
              Novedades
            </button>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div role="search" className="relative">
            <label htmlFor="buscar-productos" className="sr-only">
              Buscar productos
            </label>
            <input
              id="buscar-productos"
              ref={busqueda}
              type="search"
              defaultValue={params.get('q') ?? ''}
              onChange={(e) => buscar(e.target.value)}
              placeholder="Buscar..."
              className="w-32 border border-stone-200 bg-transparent py-1.5 pr-3 pl-8 text-base text-stone-700 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none md:w-44 md:text-xs"
            />
            <Icon
              name="buscar"
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-stone-400"
            />
          </div>
          {hayFiltros && (
            <button
              type="button"
              onClick={limpiar}
              className="cursor-pointer text-xs text-stone-500 underline underline-offset-4 transition-colors hover:text-stone-800"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
