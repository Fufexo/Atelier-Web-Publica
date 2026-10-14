'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import ConfirmDeleteButton from '@/components/admin/ConfirmDeleteButton'
import { formatearPrecio } from '@/lib/format'
import { STOCK_BAJO } from '@/lib/pedidos'
import { eliminarProducto, eliminarProductos, toggleActivo } from './actions'

export interface FilaProducto {
  id: string
  nombre: string
  sku: string | null
  precio: number
  precio_oferta: number | null
  activo: boolean
  destacado: boolean
  imagen: string | null
  categoria: string | null
  stock: number
}

export default function TablaProductos({ productos }: { productos: FilaProducto[] }) {
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set())
  const [eliminando, startTransition] = useTransition()
  const todos = productos.length > 0 && seleccionados.size === productos.length

  function alternar(id: string) {
    setSeleccionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function eliminarSeleccionados() {
    if (!confirm(`¿Eliminar ${seleccionados.size} productos? Esta acción no se puede deshacer.`)) return
    startTransition(async () => {
      await eliminarProductos([...seleccionados])
      setSeleccionados(new Set())
    })
  }

  return (
    <div>
      {seleccionados.size > 0 && (
        <div className="mb-4 flex items-center gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <span className="text-sm font-medium text-red-700">
            {seleccionados.size}{' '}
            {seleccionados.size === 1 ? 'producto seleccionado' : 'productos seleccionados'}
          </span>
          <button
            type="button"
            onClick={eliminarSeleccionados}
            disabled={eliminando}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {eliminando ? 'Eliminando…' : 'Eliminar seleccionados'}
          </button>
          <button
            type="button"
            onClick={() => setSeleccionados(new Set())}
            className="text-xs text-red-600 hover:text-red-800"
          >
            Cancelar
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs tracking-wide text-gray-500 uppercase">
            <tr>
              <th scope="col" className="w-10 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  aria-label="Seleccionar todos"
                  checked={todos}
                  onChange={() => setSeleccionados(todos ? new Set() : new Set(productos.map((p) => p.id)))}
                  className="size-4 rounded border-gray-300"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left">
                Producto
              </th>
              <th scope="col" className="px-6 py-3 text-left">
                Categoría
              </th>
              <th scope="col" className="px-6 py-3 text-left">
                Precio
              </th>
              <th scope="col" className="px-6 py-3 text-left">
                Stock
              </th>
              <th scope="col" className="px-6 py-3 text-left">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {productos.map((p) => {
              const marcado = seleccionados.has(p.id)
              return (
                <tr key={p.id} className={`hover:bg-gray-50 ${marcado ? 'bg-red-50/50' : ''}`}>
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      aria-label={`Seleccionar ${p.nombre}`}
                      checked={marcado}
                      onChange={() => alternar(p.id)}
                      className="size-4 rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {p.imagen ? (
                        <Image
                          src={p.imagen}
                          alt=""
                          width={40}
                          height={40}
                          className="size-10 rounded-lg border border-gray-200 object-cover"
                        />
                      ) : (
                        <div className="size-10 rounded-lg bg-gray-100" />
                      )}
                      <div>
                        <p className="flex items-center gap-2 font-medium text-gray-900">
                          {p.nombre}
                          {p.destacado && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                              ★ Destacado
                            </span>
                          )}
                        </p>
                        {p.sku && <p className="text-xs text-gray-500">SKU: {p.sku}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{p.categoria ?? '—'}</td>
                  <td className="px-6 py-4">
                    <span className="font-medium">{formatearPrecio(p.precio)}</span>
                    {p.precio_oferta !== null && (
                      <p className="text-xs text-green-700">Oferta: {formatearPrecio(p.precio_oferta)}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        p.stock === 0
                          ? 'font-medium text-red-600'
                          : p.stock <= STOCK_BAJO
                            ? 'font-medium text-amber-700'
                            : 'text-gray-700'
                      }
                    >
                      {p.stock} uds.
                    </span>
                    {p.stock === 0 && (
                      <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] text-red-700">
                        Sin stock
                      </span>
                    )}
                    {p.stock > 0 && p.stock <= STOCK_BAJO && (
                      <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">
                        Stock bajo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <form action={toggleActivo.bind(null, p.id, p.activo)}>
                      <button
                        type="submit"
                        title={p.activo ? 'Click para ocultar de la tienda' : 'Click para publicar'}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-75 ${
                          p.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </form>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/productos/${p.id}`}
                        className="text-xs font-medium text-slate-600 hover:text-slate-900"
                      >
                        Editar
                      </Link>
                      <ConfirmDeleteButton
                        action={eliminarProducto.bind(null, p.id)}
                        mensaje={`¿Eliminar "${p.nombre}"?`}
                        className="text-xs font-medium text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </ConfirmDeleteButton>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
