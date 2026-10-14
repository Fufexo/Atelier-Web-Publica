'use client'

import Image from 'next/image'
import Link from 'next/link'
import EmptyState from '@/components/ui/EmptyState'
import ResumenTotales from '@/components/store/ResumenTotales'
import Icon from '@/components/ui/Icon'
import QuantityStepper from '@/components/ui/QuantityStepper'
import { boton } from '@/components/ui/button'
import { useCarrito, useHidratado } from '@/lib/carrito'
import { formatearPrecio } from '@/lib/format'
import { calcularTotales } from '@/lib/precios'

export default function CarritoView() {
  const { items, quitar, actualizarCantidad, total, totalItems } = useCarrito()
  const hidratado = useHidratado()

  // Antes de leer localStorage no sabemos si hay productos: no mostrar "vacío" de más.
  if (!hidratado) return <div className="flex-1 bg-white" aria-busy="true" />

  if (items.length === 0) {
    return (
      <div className="flex flex-1 bg-white">
        <EmptyState
          icono="bolsa"
          titulo="Tu carrito está vacío"
          descripcion="Agrega productos para continuar."
        >
          <Link href="/tienda" className={boton()}>
            Ver tienda
          </Link>
        </EmptyState>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-8">
        <h1 className="mb-2 font-serif text-3xl text-stone-900">Carrito</h1>
        <p className="mb-10 text-sm text-stone-500">
          {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
        </p>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
          <ul className="divide-y divide-stone-100 lg:col-span-2">
            {items.map((item) => (
              <li key={item.varianteId} className="flex gap-4 py-6">
                <Link
                  href={`/producto/${item.slug}`}
                  className="relative h-28 w-20 shrink-0 overflow-hidden bg-stone-100 min-[400px]:h-32 min-[400px]:w-24"
                  tabIndex={-1}
                  aria-hidden
                >
                  {item.imagen ? (
                    <Image src={item.imagen} alt="" fill sizes="96px" className="object-cover" />
                  ) : (
                    <Icon name="imagen" className="m-auto mt-10 size-8 text-stone-300" />
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="text-sm leading-snug font-medium text-stone-900">
                        <Link href={`/producto/${item.slug}`} className="underline-offset-2 hover:underline">
                          {item.nombre}
                        </Link>
                      </h2>
                      {(item.talla || item.color) && (
                        <p className="mt-0.5 text-xs text-stone-500">
                          {[item.talla && `Talla ${item.talla}`, item.color].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-stone-900">
                        {formatearPrecio(item.precio * item.cantidad)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => quitar(item.varianteId)}
                      className="-mt-2 -mr-2 flex size-11 shrink-0 items-center justify-center text-stone-400 transition-colors hover:text-red-600"
                    >
                      <Icon name="cerrar" label={`Quitar ${item.nombre} del carrito`} />
                    </button>
                  </div>

                  <div className="mt-3">
                    <QuantityStepper
                      size="sm"
                      value={item.cantidad}
                      min={0}
                      max={item.stock}
                      etiqueta={item.nombre}
                      onChange={(n) => actualizarCantidad(item.varianteId, n)}
                    />
                    {item.cantidad >= item.stock && (
                      <p className="mt-1.5 text-xs text-amber-700">Máximo disponible: {item.stock}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside aria-labelledby="titulo-resumen" className="lg:col-span-1">
            <div className="bg-crema sticky top-28 p-6">
              <h2 id="titulo-resumen" className="mb-6 text-sm tracking-widest text-stone-600 uppercase">
                Resumen
              </h2>
              <div className="mb-6">
                <ResumenTotales totales={calcularTotales(total)} envio={null} />
              </div>
              <Link href="/checkout" className={boton({ ancho: 'completo', className: 'py-4' })}>
                Proceder al pago
              </Link>
              <Link
                href="/tienda"
                className="mt-4 block text-center text-xs text-stone-600 underline underline-offset-4 transition-colors hover:text-stone-800"
              >
                Seguir comprando
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
