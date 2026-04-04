'use client'

import Link from 'next/link'
import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import { useCarrito } from '@/lib/carrito'
import { formatearPrecio } from '@/lib/utils'

const IGV = 0.18

export default function CarritoPage() {
  const { items, quitar, actualizarCantidad, total, totalItems } = useCarrito()

  const subtotal = total / (1 + IGV)
  const igv = total - subtotal

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-white flex flex-col items-center justify-center text-center px-8">
          <span className="material-symbols-outlined text-stone-200 text-8xl mb-6">shopping_bag</span>
          <h1 className="text-2xl text-stone-900 mb-3" style={{ fontFamily: 'var(--font-noto-serif)' }}>
            Tu carrito está vacío
          </h1>
          <p className="text-sm text-stone-400 mb-8" style={{ fontFamily: 'var(--font-manrope)' }}>
            Agrega productos para continuar
          </p>
          <Link
            href="/tienda"
            className="bg-stone-900 text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-stone-700 transition-colors"
            style={{ fontFamily: 'var(--font-manrope)' }}
          >
            Ver tienda
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-white">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <h1 className="text-3xl text-stone-900 mb-2" style={{ fontFamily: 'var(--font-noto-serif)' }}>
            Carrito
          </h1>
          <p className="text-sm text-stone-400 mb-10" style={{ fontFamily: 'var(--font-manrope)' }}>
            {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Items */}
            <div className="lg:col-span-2 divide-y divide-stone-100">
              {items.map((item) => (
                <div key={item.varianteId} className="flex gap-6 py-6">
                  {/* Imagen */}
                  <Link href={`/producto/${item.slug}`} className="shrink-0">
                    <div className="w-24 h-32 bg-stone-100 overflow-hidden">
                      {item.imagen ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-stone-300">deployed_code</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/producto/${item.slug}`}>
                        <h3 className="text-sm font-medium text-stone-900 hover:underline underline-offset-2" style={{ fontFamily: 'var(--font-manrope)' }}>
                          {item.nombre}
                        </h3>
                      </Link>
                      <div className="flex flex-col gap-0.5 mt-1">
                        {item.talla && (
                          <span className="text-xs text-stone-400" style={{ fontFamily: 'var(--font-manrope)' }}>
                            Talla {item.talla}
                          </span>
                        )}
                        {item.color && (
                          <span className="text-xs text-stone-400" style={{ fontFamily: 'var(--font-manrope)' }}>
                            {item.color}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Cantidad */}
                      <div className="flex items-center border border-stone-200">
                        <button
                          onClick={() => actualizarCantidad(item.varianteId, item.cantidad - 1)}
                          className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors text-lg"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm" style={{ fontFamily: 'var(--font-manrope)' }}>
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => actualizarCantidad(item.varianteId, item.cantidad + 1)}
                          className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors text-lg"
                        >
                          +
                        </button>
                      </div>

                      {/* Precio y eliminar */}
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-stone-900" style={{ fontFamily: 'var(--font-manrope)' }}>
                          {formatearPrecio(item.precio * item.cantidad)}
                        </span>
                        <button
                          onClick={() => quitar(item.varianteId)}
                          className="text-stone-300 hover:text-red-400 transition-colors"
                          aria-label="Eliminar"
                        >
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen */}
            <div className="lg:col-span-1">
              <div className="bg-[#f5f2ed] p-6 sticky top-28">
                <h2 className="text-sm uppercase tracking-widest text-stone-500 mb-6" style={{ fontFamily: 'var(--font-manrope)' }}>
                  Resumen
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm" style={{ fontFamily: 'var(--font-manrope)' }}>
                    <span className="text-stone-500">Subtotal (sin IGV)</span>
                    <span className="text-stone-900">{formatearPrecio(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm" style={{ fontFamily: 'var(--font-manrope)' }}>
                    <span className="text-stone-500">IGV (18%)</span>
                    <span className="text-stone-900">{formatearPrecio(igv)}</span>
                  </div>
                  <div className="flex justify-between text-sm" style={{ fontFamily: 'var(--font-manrope)' }}>
                    <span className="text-stone-500">Envío</span>
                    <span className="text-stone-400">Se calcula al pagar</span>
                  </div>
                </div>

                <div className="border-t border-stone-200 pt-4 mb-6">
                  <div className="flex justify-between" style={{ fontFamily: 'var(--font-manrope)' }}>
                    <span className="font-medium text-stone-900">Total</span>
                    <span className="font-medium text-stone-900 text-lg">{formatearPrecio(total)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full bg-stone-900 text-white text-center py-4 text-xs uppercase tracking-widest hover:bg-stone-700 transition-colors"
                  style={{ fontFamily: 'var(--font-manrope)' }}
                >
                  Proceder al pago
                </Link>

                <Link
                  href="/tienda"
                  className="block text-center mt-4 text-xs text-stone-400 hover:text-stone-700 underline underline-offset-4 transition-colors"
                  style={{ fontFamily: 'var(--font-manrope)' }}
                >
                  Seguir comprando
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
