'use client'

import Image from 'next/image'
import { useState, ViewTransition } from 'react'
import Icon from '@/components/ui/Icon'
import QuantityStepper from '@/components/ui/QuantityStepper'
import { boton } from '@/components/ui/button'
import { useCarrito } from '@/lib/carrito'
import { formatearPrecio } from '@/lib/format'
import type { ImagenProducto, Variante } from '@/lib/types'

interface Props {
  productoId: string
  slug: string
  nombre: string
  descripcion: string | null
  precio: number
  precioOferta: number | null
  imagenes: ImagenProducto[]
  /** Solo variantes activas. */
  variantes: Variante[]
}

function unicos(valores: (string | null)[]): string[] {
  return [...new Set(valores.filter((v): v is string => !!v))]
}

export default function ProductoDetalle({
  productoId,
  slug,
  nombre,
  descripcion,
  precio,
  precioOferta,
  imagenes,
  variantes,
}: Props) {
  const { agregar } = useCarrito()

  const colores = unicos(variantes.map((v) => v.color))
  const tallas = unicos(variantes.map((v) => v.talla))

  const [imagenIdx, setImagenIdx] = useState(0)
  const [colorSel, setColorSel] = useState<string | null>(colores[0] ?? null)
  const [tallaSel, setTallaSel] = useState<string | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [agregado, setAgregado] = useState(false)

  // Convención del admin: la imagen N corresponde al color N. Elegir uno sincroniza el otro.
  function seleccionarImagen(idx: number) {
    setImagenIdx(idx)
    if (colores[idx]) seleccionarColor(colores[idx], false)
  }

  function seleccionarColor(color: string, moverImagen = true) {
    setColorSel(color)
    setTallaSel(null)
    setCantidad(1)
    const idx = colores.indexOf(color)
    if (moverImagen && idx >= 0 && imagenes[idx]) setImagenIdx(idx)
  }

  const delColor = variantes.filter((v) => colores.length === 0 || v.color === colorSel)
  const tallasConStock = new Set(delColor.filter((v) => v.stock > 0).map((v) => v.talla))
  const seleccionada = delColor.find((v) => tallas.length === 0 || v.talla === tallaSel)

  const stock = seleccionada?.stock ?? 0
  const puedeAgregar = !!seleccionada && stock > 0
  const falta = tallas.length > 0 && !tallaSel ? 'Selecciona una talla' : null

  function agregarAlCarrito() {
    if (!seleccionada || !puedeAgregar) return
    agregar(
      {
        varianteId: seleccionada.id,
        productoId,
        slug,
        nombre,
        imagen: imagenes[imagenIdx]?.url ?? imagenes[0]?.url ?? '',
        precio: precioOferta ?? precio,
        talla: seleccionada.talla,
        color: seleccionada.color,
        stock,
      },
      cantidad
    )
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  const imagen = imagenes[imagenIdx]

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
      {/* ── Galería ── */}
      <div className="flex flex-col-reverse gap-4 sm:flex-row">
        {imagenes.length > 1 && (
          <div className="flex scrollbar-none gap-2 overflow-x-auto sm:w-16 sm:shrink-0 sm:flex-col">
            {imagenes.map((img, i) => (
              <button
                key={img.url}
                type="button"
                onClick={() => seleccionarImagen(i)}
                aria-label={`Ver imagen ${i + 1} de ${imagenes.length}`}
                aria-current={imagenIdx === i}
                className={`relative aspect-square w-16 shrink-0 overflow-hidden border-2 transition-colors ${
                  imagenIdx === i ? 'border-stone-900' : 'border-transparent'
                }`}
              >
                <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
        <div className="relative aspect-3/4 flex-1 overflow-hidden bg-stone-100">
          {imagen ? (
            <ViewTransition name={imagenIdx === 0 ? `producto-${slug}` : undefined}>
              <Image
                src={imagen.url}
                alt={imagen.alt || nombre}
                fill
                preload={imagenIdx === 0}
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </ViewTransition>
          ) : (
            <div className="flex h-full items-center justify-center text-stone-300">
              <Icon name="imagen" className="size-20" />
            </div>
          )}
        </div>
      </div>

      {/* ── Info ── */}
      <div className="space-y-6 self-start lg:sticky lg:top-28">
        <p className="flex items-center gap-4">
          <span className="text-2xl text-stone-900">{formatearPrecio(precioOferta ?? precio)}</span>
          {precioOferta !== null && (
            <span className="text-lg text-stone-500 line-through">
              <span className="sr-only">Antes </span>
              {formatearPrecio(precio)}
            </span>
          )}
        </p>

        <div className="w-12 border-t border-stone-200" />

        {descripcion && (
          <div className="space-y-3">
            {descripcion.split(/\n\s*\n/).map((parrafo, i) => (
              <p key={i} className="text-sm leading-relaxed text-stone-600">
                {parrafo.trim()}
              </p>
            ))}
          </div>
        )}

        {colores.length > 0 && (
          <fieldset>
            <legend className="mb-3 text-xs tracking-widest text-stone-500 uppercase">
              Color — <span className="tracking-normal text-stone-700 normal-case">{colorSel}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {colores.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-pressed={colorSel === color}
                  onClick={() => seleccionarColor(color)}
                  className={`min-h-11 border px-4 py-2 text-xs transition-colors ${
                    colorSel === color
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-200 text-stone-700 hover:border-stone-400'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {tallas.length > 0 && (
          <fieldset>
            <legend className="mb-3 text-xs tracking-widest text-stone-500 uppercase">Talla</legend>
            <div className="flex flex-wrap gap-2">
              {tallas.map((talla) => {
                const disponible = tallasConStock.has(talla)
                return (
                  <button
                    key={talla}
                    type="button"
                    aria-pressed={tallaSel === talla}
                    onClick={() => {
                      setTallaSel(talla)
                      setCantidad(1)
                    }}
                    disabled={!disponible}
                    aria-label={disponible ? `Talla ${talla}` : `Talla ${talla}, agotada`}
                    className={`size-12 border text-sm transition-colors ${
                      tallaSel === talla
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : disponible
                          ? 'border-stone-200 text-stone-700 hover:border-stone-400'
                          : 'cursor-not-allowed border-stone-100 text-stone-300 line-through'
                    }`}
                  >
                    {talla}
                  </button>
                )
              })}
            </div>
          </fieldset>
        )}

        {puedeAgregar && (
          <div>
            <p className="mb-3 text-xs tracking-widest text-stone-500 uppercase">Cantidad</p>
            <QuantityStepper value={cantidad} onChange={setCantidad} max={stock} etiqueta={nombre} />
            {stock <= 5 && (
              <p className="mt-2 text-xs text-amber-700">
                Solo {stock === 1 ? 'queda 1 unidad' : `quedan ${stock} unidades`}
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={agregarAlCarrito}
          disabled={!puedeAgregar}
          className={boton({
            ancho: 'completo',
            className: `py-4 text-sm ${agregado ? 'bg-stone-600 hover:bg-stone-600' : ''} disabled:bg-stone-100 disabled:text-stone-500`,
          })}
        >
          {agregado ? '✓ Agregado al carrito' : (falta ?? (puedeAgregar ? 'Añadir al carrito' : 'Sin stock'))}
        </button>
        <p aria-live="polite" className="sr-only">
          {agregado ? `${nombre} agregado al carrito` : ''}
        </p>
      </div>
    </div>
  )
}
