'use client'

import { useState, useMemo } from 'react'
import { formatearPrecio } from '@/lib/utils'
import { useCarrito } from '@/lib/carrito'
import type { ImagenProducto, Variante } from '@/lib/types'

interface Props {
  productoId: string
  slug: string
  nombre: string
  descripcion: string | null
  precio: number
  precioOferta: number | null
  imagenes: ImagenProducto[]
  variantes: Variante[]
}

export default function ProductoDetalle({ productoId, slug, nombre, descripcion, precio, precioOferta, imagenes, variantes }: Props) {
  const { agregar } = useCarrito()

  const activas = variantes.filter((v) => v.activa)
  const colores = [...new Set(activas.filter((v) => v.color).map((v) => v.color!))]
  const tallas = [...new Set(activas.filter((v) => v.talla).map((v) => v.talla!))]

  const [imagenIdx, setImagenIdx] = useState(0)
  const [colorSel, setColorSel] = useState<string | null>(colores[0] ?? null)
  const [tallaSel, setTallaSel] = useState<string | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [agregado, setAgregado] = useState(false)

  // Cuando cambia la imagen → sincroniza color por índice
  function seleccionarImagen(idx: number) {
    setImagenIdx(idx)
    if (colores[idx]) {
      setColorSel(colores[idx])
      setTallaSel(null)
    }
  }

  // Cuando cambia el color → sincroniza imagen por índice
  function seleccionarColor(color: string) {
    setColorSel(color)
    setTallaSel(null)
    const idx = colores.indexOf(color)
    if (idx >= 0 && imagenes[idx]) setImagenIdx(idx)
  }

  const tallasDisponibles = useMemo(() =>
    activas
      .filter((v) => (colorSel ? v.color === colorSel : true) && v.stock > 0)
      .map((v) => v.talla!)
      .filter(Boolean)
  , [colorSel, activas])

  const varianteSeleccionada = activas.find((v) =>
    (colores.length === 0 || v.color === colorSel) &&
    (tallas.length === 0 || v.talla === tallaSel)
  )

  const stock = varianteSeleccionada?.stock ?? 0
  const sinStock = !!varianteSeleccionada && stock === 0
  const puedeAgregar = !!varianteSeleccionada && stock > 0

  function agregarAlCarrito() {
    if (!puedeAgregar || !varianteSeleccionada) return
    agregar({
      varianteId: varianteSeleccionada.id,
      productoId,
      slug,
      nombre,
      imagen: imagenes[imagenIdx]?.url ?? imagenes[0]?.url ?? '',
      precio: precioOferta ?? precio,
      talla: tallaSel,
      color: colorSel,
    }, cantidad)
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  const precioMostrar = precioOferta ?? precio

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
      {/* ── Galería ── */}
      <div className="flex gap-4">
        {imagenes.length > 1 && (
          <div className="flex flex-col gap-2 w-16 shrink-0">
            {imagenes.map((img, i) => (
              <button
                key={i}
                onClick={() => seleccionarImagen(i)}
                className={`aspect-square overflow-hidden border-2 transition-colors ${
                  imagenIdx === i ? 'border-stone-900' : 'border-transparent'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt || nombre} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
        <div className="flex-1 aspect-[3/4] overflow-hidden bg-stone-100">
          {imagenes.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagenes[imagenIdx].url}
              alt={imagenes[imagenIdx].alt || nombre}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-stone-300 text-8xl">deployed_code</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Info ── */}
      <div className="lg:sticky lg:top-28 self-start space-y-6">
        {/* Precio */}
        <div className="flex items-center gap-4">
          <span className="text-2xl text-stone-900" style={{ fontFamily: 'var(--font-manrope)' }}>
            {formatearPrecio(precioMostrar)}
          </span>
          {precioOferta && (
            <span className="text-lg text-stone-400 line-through" style={{ fontFamily: 'var(--font-manrope)' }}>
              {formatearPrecio(precio)}
            </span>
          )}
        </div>

        <div className="w-12 border-t border-stone-200" />

        {/* Descripción */}
        {descripcion && (
          <div className="space-y-3">
            {descripcion.split(/\n\s*\n/).map((parrafo, i) => (
              <p key={i} className="text-sm text-stone-500 leading-relaxed" style={{ fontFamily: 'var(--font-manrope)' }}>
                {parrafo.trim()}
              </p>
            ))}
          </div>
        )}

        {/* Color */}
        {colores.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-400 mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>
              Color — <span className="text-stone-600 normal-case tracking-normal">{colorSel}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {colores.map((color) => (
                <button
                  key={color}
                  onClick={() => seleccionarColor(color)}
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
                    className={`w-12 h-12 text-sm border transition-colors ${
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
              <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors">−</button>
              <span className="w-10 text-center text-sm" style={{ fontFamily: 'var(--font-manrope)' }}>{cantidad}</span>
              <button onClick={() => setCantidad(Math.min(stock, cantidad + 1))} className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors">+</button>
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
          {agregado ? '✓ Agregado al carrito' : sinStock ? 'Sin stock' : tallas.length > 0 && !tallaSel ? 'Selecciona una talla' : 'Añadir al carrito'}
        </button>
      </div>
    </div>
  )
}
