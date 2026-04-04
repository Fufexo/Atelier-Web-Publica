'use client'

import { useState, useMemo } from 'react'
import { formatearPrecio } from '@/lib/utils'
import { useCarrito } from '@/lib/carrito'
import type { Variante } from '@/lib/types'

interface Props {
  variantes: Variante[]
  precio: number
  precioOferta: number | null
  productoId: string
  slug: string
  nombre: string
  imagen: string
}

export default function SelectorVariantes({ variantes, precio, precioOferta, productoId, slug, nombre, imagen }: Props) {
  const { agregar } = useCarrito()
  const activas = variantes.filter((v) => v.activa)

  const colores = useMemo(() =>
    [...new Set(activas.filter((v) => v.color).map((v) => v.color!))]
  , [activas])

  const tallas = useMemo(() =>
    [...new Set(activas.filter((v) => v.talla).map((v) => v.talla!))]
  , [activas])

  const soloTallas = colores.length === 0
  const soloColores = tallas.length === 0

  const [colorSel, setColorSel] = useState<string | null>(colores[0] ?? null)
  const [tallaSel, setTallaSel] = useState<string | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [agregado, setAgregado] = useState(false)

  const tallasDisponibles = useMemo(() => {
    if (!colorSel) return tallas
    return activas
      .filter((v) => v.color === colorSel && v.stock > 0)
      .map((v) => v.talla!)
      .filter(Boolean)
  }, [colorSel, activas, tallas])

  const varianteSeleccionada = activas.find((v) =>
    (soloTallas ? true : v.color === colorSel) &&
    (soloColores ? true : v.talla === tallaSel)
  )

  const stock = varianteSeleccionada?.stock ?? 0
  const sinStock = varianteSeleccionada ? stock === 0 : false
  const puedeAgregar = varianteSeleccionada && stock > 0

  function agregarAlCarrito() {
    if (!puedeAgregar || !varianteSeleccionada) return
    agregar({
      varianteId: varianteSeleccionada.id,
      productoId,
      slug,
      nombre,
      imagen,
      precio: precioOferta ?? precio,
      talla: tallaSel,
      color: colorSel,
    })
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Color */}
      {colores.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>
            Color{colorSel ? <span className="text-stone-600 normal-case tracking-normal ml-2">— {colorSel}</span> : null}
          </p>
          <div className="flex flex-wrap gap-2">
            {colores.map((color) => (
              <button
                key={color}
                onClick={() => { setColorSel(color); setTallaSel(null) }}
                className={`px-4 py-2 text-xs border transition-colors ${
                  colorSel === color
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-200 text-stone-700 hover:border-stone-400'
                }`}
                style={{ fontFamily: 'var(--font-manrope)' }}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Talla */}
      {tallas.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>
            Talla
          </p>
          <div className="flex flex-wrap gap-2">
            {tallas.map((talla) => {
              const disponible = tallasDisponibles.includes(talla)
              return (
                <button
                  key={talla}
                  onClick={() => disponible && setTallaSel(talla)}
                  disabled={!disponible}
                  className={`w-12 h-12 text-sm border transition-colors relative ${
                    tallaSel === talla
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : disponible
                        ? 'border-stone-200 text-stone-700 hover:border-stone-400'
                        : 'border-stone-100 text-stone-300 cursor-not-allowed line-through'
                  }`}
                  style={{ fontFamily: 'var(--font-manrope)' }}
                >
                  {talla}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Cantidad */}
      {puedeAgregar && (
        <div>
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>
            Cantidad
          </p>
          <div className="flex items-center border border-stone-200 w-fit">
            <button
              onClick={() => setCantidad(Math.max(1, cantidad - 1))}
              className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors"
            >
              −
            </button>
            <span className="w-10 text-center text-sm" style={{ fontFamily: 'var(--font-manrope)' }}>
              {cantidad}
            </span>
            <button
              onClick={() => setCantidad(Math.min(stock, cantidad + 1))}
              className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors"
            >
              +
            </button>
          </div>
          {stock <= 5 && (
            <p className="text-xs text-amber-600 mt-2" style={{ fontFamily: 'var(--font-manrope)' }}>
              Solo quedan {stock} unidades
            </p>
          )}
        </div>
      )}

      {/* Botón */}
      <button
        onClick={agregarAlCarrito}
        disabled={!puedeAgregar || sinStock}
        className={`w-full py-4 text-sm uppercase tracking-widest font-medium transition-all duration-300 ${
          agregado
            ? 'bg-stone-600 text-white'
            : puedeAgregar
              ? 'bg-stone-900 text-white hover:bg-stone-700'
              : 'bg-stone-100 text-stone-400 cursor-not-allowed'
        }`}
        style={{ fontFamily: 'var(--font-manrope)' }}
      >
        {agregado ? '✓ Agregado al carrito' : sinStock ? 'Sin stock' : !varianteSeleccionada ? 'Selecciona talla' : 'Añadir al carrito'}
      </button>
    </div>
  )
}
