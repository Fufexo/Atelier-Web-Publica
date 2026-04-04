'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { formatearPrecio } from '@/lib/utils'
import { toggleActivo, eliminarProducto, eliminarProductos } from './actions'
import ConfirmDeleteButton from '@/components/admin/ConfirmDeleteButton'

interface Producto {
  id: string
  nombre: string
  sku: string | null
  precio: number
  precio_oferta: number | null
  activo: boolean
  destacado: boolean
  imagenes: unknown
  categorias: { nombre: string } | null
  variantes: { stock: number }[]
}

interface Props {
  productos: Producto[]
}

export default function TablaProductos({ productos }: Props) {
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const todosSeleccionados = seleccionados.size === productos.length && productos.length > 0

  function toggleTodos() {
    if (todosSeleccionados) {
      setSeleccionados(new Set())
    } else {
      setSeleccionados(new Set(productos.map((p) => p.id)))
    }
  }

  function toggleUno(id: string) {
    const next = new Set(seleccionados)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSeleccionados(next)
  }

  function eliminarSeleccionados() {
    startTransition(async () => {
      await eliminarProductos(Array.from(seleccionados))
      setSeleccionados(new Set())
    })
  }

  return (
    <div>
      {/* Barra de acciones bulk */}
      {seleccionados.size > 0 && (
        <div className="flex items-center gap-4 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-sm text-red-700 font-medium">
            {seleccionados.size} {seleccionados.size === 1 ? 'producto seleccionado' : 'productos seleccionados'}
          </span>
          <button
            onClick={eliminarSeleccionados}
            disabled={isPending}
            className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Eliminando...' : 'Eliminar seleccionados'}
          </button>
          <button
            onClick={() => setSeleccionados(new Set())}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Cancelar
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left w-10">
                <input
                  type="checkbox"
                  checked={todosSeleccionados}
                  onChange={toggleTodos}
                  className="w-4 h-4 rounded border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-left">Producto</th>
              <th className="px-6 py-3 text-left">Categoría</th>
              <th className="px-6 py-3 text-left">Precio</th>
              <th className="px-6 py-3 text-left">Stock</th>
              <th className="px-6 py-3 text-left">Estado</th>
              <th className="px-6 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {productos.map((producto) => {
              const imagen = Array.isArray(producto.imagenes) ? producto.imagenes[0] : null
              const stockTotal = producto.variantes?.reduce((sum, v) => sum + v.stock, 0) ?? 0
              const marcado = seleccionados.has(producto.id)

              return (
                <tr key={producto.id} className={`hover:bg-gray-50 ${marcado ? 'bg-red-50/50' : ''}`}>
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={marcado}
                      onChange={() => toggleUno(producto.id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {imagen ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={(imagen as { url: string }).url}
                          alt={producto.nombre}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <span className="material-symbols-outlined text-gray-300 text-lg">image</span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{producto.nombre}</p>
                          {producto.destacado && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                              ★ Destacado
                            </span>
                          )}
                        </div>
                        {producto.sku && (
                          <p className="text-xs text-gray-400">SKU: {producto.sku}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {producto.categorias?.nombre ?? '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium">{formatearPrecio(producto.precio)}</span>
                    {producto.precio_oferta && (
                      <p className="text-xs text-green-600">Oferta: {formatearPrecio(producto.precio_oferta)}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={
                      stockTotal === 0
                        ? 'text-red-600 font-medium'
                        : stockTotal <= 5
                          ? 'text-amber-600 font-medium'
                          : 'text-gray-700'
                    }>
                      {stockTotal} uds.
                      {stockTotal === 0 && <span className="ml-1.5 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Sin stock</span>}
                      {stockTotal > 0 && stockTotal <= 5 && <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">Stock bajo</span>}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <form action={toggleActivo.bind(null, producto.id, producto.activo)}>
                      <button
                        type="submit"
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-opacity hover:opacity-75 ${
                          producto.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {producto.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </form>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/productos/${producto.id}`}
                        className="text-slate-600 hover:text-slate-900 text-xs font-medium"
                      >
                        Editar
                      </Link>
                      <ConfirmDeleteButton
                        action={eliminarProducto.bind(null, producto.id)}
                        mensaje="¿Eliminar este producto?"
                        className="text-red-400 hover:text-red-600 text-xs font-medium"
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
