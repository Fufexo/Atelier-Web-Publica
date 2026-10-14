import Link from 'next/link'
import { AdminHeader, Card, EstadoPedidoBadge } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/auth'
import { formatearFecha, formatearPrecio, numeroPedido } from '@/lib/format'
import { ESTADO_PEDIDO, ESTADOS_PEDIDO, esEstadoPedido } from '@/lib/pedidos'
import { parsearDireccion } from '@/lib/types'

export const metadata = { title: 'Pedidos' }

const POR_PAGINA = 50

export default async function PedidosPage({ searchParams }: PageProps<'/admin/pedidos'>) {
  const { estado: estadoParam } = await searchParams
  const estado = typeof estadoParam === 'string' && esEstadoPedido(estadoParam) ? estadoParam : null
  const { supabase } = await requireAdmin()

  let query = supabase
    .from('pedidos')
    .select('id, numero, nombre_comprador, email_comprador, direccion_envio, total, estado, created_at')
    .order('created_at', { ascending: false })
    .limit(POR_PAGINA)
  if (estado) query = query.eq('estado', estado)

  const { data: pedidos, error } = await query
  if (error) throw new Error(error.message)

  const filtros = [
    { valor: null, label: 'Todos' },
    ...ESTADOS_PEDIDO.map((e) => ({ valor: e, label: ESTADO_PEDIDO[e].label })),
  ]

  return (
    <div className="p-8">
      <AdminHeader titulo="Pedidos" />

      <nav aria-label="Filtrar por estado" className="mb-6 flex flex-wrap gap-2">
        {filtros.map((f) => (
          <Link
            key={f.label}
            href={f.valor ? `/admin/pedidos?estado=${f.valor}` : '/admin/pedidos'}
            aria-current={estado === f.valor ? 'page' : undefined}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              estado === f.valor
                ? 'bg-slate-900 text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <Card className="overflow-x-auto">
        {pedidos.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-gray-500">
            No hay pedidos{estado ? ` con estado "${ESTADO_PEDIDO[estado].label}"` : ''}.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs tracking-wide text-gray-500 uppercase">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">
                  N°
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  Comprador
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  Destino
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pedidos.map((pedido) => {
                const dir = parsearDireccion(pedido.direccion_envio)
                return (
                  <tr key={pedido.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{numeroPedido(pedido.numero)}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{pedido.nombre_comprador}</p>
                      <p className="text-xs text-gray-500">{pedido.email_comprador}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {dir.distrito}, {dir.departamento}
                    </td>
                    <td className="px-6 py-4 font-medium">{formatearPrecio(pedido.total)}</td>
                    <td className="px-6 py-4">
                      <EstadoPedidoBadge estado={pedido.estado} />
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{formatearFecha(pedido.created_at)}</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/pedidos/${pedido.id}`}
                        className="text-xs font-medium text-slate-600 hover:text-slate-900"
                      >
                        Ver <span className="sr-only">pedido {numeroPedido(pedido.numero)}</span> →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Card>
      {pedidos.length === POR_PAGINA && (
        <p className="mt-4 text-xs text-gray-500">Mostrando los {POR_PAGINA} pedidos más recientes.</p>
      )}
    </div>
  )
}
