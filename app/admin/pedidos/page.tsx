import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatearPrecio, formatearFecha, ESTADO_PEDIDO_COLORS, ESTADO_PEDIDO_LABELS } from '@/lib/utils'
import type { DireccionEnvio } from '@/lib/types'

export const metadata = { title: 'Pedidos — Admin' }

const ESTADOS = ['todos', 'pendiente', 'pagado', 'preparando', 'enviado', 'entregado', 'cancelado']

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  const params = await searchParams
  const estado = params.estado ?? 'todos'

  const supabase = await createClient()
  let query = supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false })

  if (estado !== 'todos') {
    query = query.eq('estado', estado)
  }

  const { data: pedidos } = await query

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pedidos</h1>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {ESTADOS.map((e) => (
          <Link
            key={e}
            href={`/admin/pedidos${e !== 'todos' ? `?estado=${e}` : ''}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              estado === e
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {e === 'todos' ? 'Todos' : ESTADO_PEDIDO_LABELS[e]}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {!pedidos?.length ? (
          <p className="px-6 py-12 text-sm text-gray-400 text-center">
            No hay pedidos {estado !== 'todos' ? `con estado "${ESTADO_PEDIDO_LABELS[estado]}"` : ''}.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">N°</th>
                <th className="px-6 py-3 text-left">Comprador</th>
                <th className="px-6 py-3 text-left">Destino</th>
                <th className="px-6 py-3 text-left">Total</th>
                <th className="px-6 py-3 text-left">Estado</th>
                <th className="px-6 py-3 text-left">Fecha</th>
                <th className="px-6 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pedidos.map((pedido) => {
                const dir = pedido.direccion_envio as DireccionEnvio
                return (
                  <tr key={pedido.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">#{pedido.numero}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{pedido.nombre_comprador}</p>
                        <p className="text-xs text-gray-400">{pedido.email_comprador}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">
                      {dir?.distrito}, {dir?.departamento}
                    </td>
                    <td className="px-6 py-4 font-medium">{formatearPrecio(pedido.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_PEDIDO_COLORS[pedido.estado]}`}>
                        {ESTADO_PEDIDO_LABELS[pedido.estado]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {formatearFecha(pedido.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/pedidos/${pedido.id}`}
                        className="text-slate-600 hover:text-slate-900 text-xs font-medium"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
