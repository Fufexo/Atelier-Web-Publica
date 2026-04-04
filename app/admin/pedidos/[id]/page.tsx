import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  formatearPrecio,
  formatearFecha,
  ESTADO_PEDIDO_COLORS,
  ESTADO_PEDIDO_LABELS,
} from '@/lib/utils'
import { actualizarEstadoPedido } from '../actions'
import type { EstadoPedido, DireccionEnvio } from '@/lib/types'

const ESTADOS_PEDIDO: EstadoPedido[] = [
  'pendiente', 'pagado', 'preparando', 'enviado', 'entregado', 'cancelado', 'reembolsado',
]

const ESTADO_DOT: Record<string, string> = {
  pendiente:    'bg-yellow-400',
  pagado:       'bg-blue-400',
  preparando:   'bg-purple-400',
  enviado:      'bg-indigo-400',
  entregado:    'bg-green-400',
  cancelado:    'bg-red-400',
  reembolsado:  'bg-gray-400',
}

export default async function DetallePedidoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: pedido } = await supabase
    .from('pedidos')
    .select('*, items_pedido(*), pagos(*)')
    .eq('id', id)
    .single()

  if (!pedido) notFound()

  const dir = pedido.direccion_envio as DireccionEnvio
  const items = pedido.items_pedido ?? []
  const pagos = pedido.pagos ?? []

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/admin/pedidos" className="text-gray-400 hover:text-gray-600">
            ← Pedidos
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-2xl font-bold text-gray-900">Pedido #{pedido.numero}</h1>
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_PEDIDO_COLORS[pedido.estado]}`}>
            {ESTADO_PEDIDO_LABELS[pedido.estado]}
          </span>
        </div>
        <p className="text-sm text-gray-400">{formatearFecha(pedido.created_at)}</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="col-span-2 space-y-6">
          {/* Ítems */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Productos</h2>
            </div>
            <ul className="divide-y divide-gray-100">
              {items.map((item: {
                id: string
                nombre_producto: string
                talla: string | null
                color: string | null
                cantidad: number
                precio_unitario: number
                subtotal: number
              }) => (
                <li key={item.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{item.nombre_producto}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {[item.talla, item.color].filter(Boolean).join(' · ')} · x{item.cantidad}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatearPrecio(item.subtotal)}</p>
                    <p className="text-xs text-gray-400">{formatearPrecio(item.precio_unitario)} c/u</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="px-6 py-4 border-t border-gray-100 space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatearPrecio(pedido.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>IGV (18%)</span>
                <span>{formatearPrecio(pedido.igv)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span>{pedido.costo_envio > 0 ? formatearPrecio(pedido.costo_envio) : 'Gratis'}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatearPrecio(pedido.total)}</span>
              </div>
            </div>
          </div>

          {/* Pagos */}
          {pagos.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Pago</h2>
              </div>
              {pagos.map((pago: {
                id: string
                estado: string
                metodo: string | null
                culqi_charge_id: string | null
                monto: number
                marca_tarjeta: string | null
                ultimos_4_digitos: string | null
                error_mensaje: string | null
              }) => (
                <div key={pago.id} className="px-6 py-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Estado</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      pago.estado === 'completado' ? 'bg-green-100 text-green-800' :
                      pago.estado === 'fallido' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {pago.estado}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Método</span>
                    <span className="font-medium capitalize">{pago.metodo ?? '—'}</span>
                  </div>
                  {pago.marca_tarjeta && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tarjeta</span>
                      <span className="capitalize">{pago.marca_tarjeta} •••• {pago.ultimos_4_digitos}</span>
                    </div>
                  )}
                  {pago.culqi_charge_id && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">ID Culqi</span>
                      <span className="font-mono text-xs">{pago.culqi_charge_id}</span>
                    </div>
                  )}
                  {pago.error_mensaje && (
                    <p className="text-red-600 text-xs mt-2">{pago.error_mensaje}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Comprador */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3 text-sm">Comprador</h2>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{pedido.nombre_comprador}</p>
              <p className="text-gray-500">{pedido.email_comprador}</p>
              {pedido.telefono_comprador && (
                <p className="text-gray-500">{pedido.telefono_comprador}</p>
              )}
            </div>
          </div>

          {/* Dirección */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3 text-sm">Dirección de envío</h2>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-medium text-gray-900">{dir.nombre_destinatario}</p>
              <p>{dir.direccion}</p>
              {dir.referencia && <p className="text-gray-400">{dir.referencia}</p>}
              <p>{dir.distrito}, {dir.provincia}</p>
              <p>{dir.departamento}</p>
              <p className="mt-1">{dir.telefono}</p>
            </div>
          </div>

          {/* Cambiar estado */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3 text-sm">Actualizar estado</h2>
            <div className="space-y-2">
              {ESTADOS_PEDIDO.map((e) => (
                <form key={e} action={actualizarEstadoPedido.bind(null, pedido.id, e)}>
                  <button
                    type="submit"
                    disabled={pedido.estado === e}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                      pedido.estado === e
                        ? 'ring-2 ring-offset-1 ring-slate-400 bg-gray-50 font-semibold cursor-default'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${ESTADO_DOT[e]}`} />
                    {ESTADO_PEDIDO_LABELS[e]}
                    {pedido.estado === e && (
                      <span className="ml-auto text-xs text-gray-400">actual</span>
                    )}
                  </button>
                </form>
              ))}
            </div>
          </div>

          {/* Notas */}
          {pedido.notas && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-2 text-sm">Notas</h2>
              <p className="text-sm text-gray-600">{pedido.notas}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
