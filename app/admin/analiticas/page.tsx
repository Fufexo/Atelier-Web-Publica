import { AdminHeader, Card, CardHeader } from '@/components/admin/ui'
import { diaCorto, productosMasVendidos, resumenVentas, ventasPorDia } from '@/lib/analiticas'
import { requireAdmin } from '@/lib/auth'
import { formatearPrecio, inicioDelDiaEnLima } from '@/lib/format'
import GraficoIngresos from './GraficoIngresos'

export const metadata = { title: 'Analíticas' }

const DIAS = 30
const SIN_VENTA = '("cancelado","reembolsado")'

export default async function AnaliticasPage() {
  const { supabase } = await requireAdmin()
  const desde = inicioDelDiaEnLima(DIAS - 1)

  const [pedidos, items] = await Promise.all([
    supabase
      .from('pedidos')
      .select('total, created_at')
      .gte('created_at', desde)
      .not('estado', 'in', SIN_VENTA),
    // Mismo período que el gráfico (antes sumaba todo el historial).
    supabase
      .from('items_pedido')
      .select('nombre_producto, cantidad, precio_unitario, pedidos!inner(estado, created_at)')
      .gte('pedidos.created_at', desde)
      .not('pedidos.estado', 'in', SIN_VENTA),
  ])
  if (pedidos.error) throw new Error(pedidos.error.message)
  if (items.error) throw new Error(items.error.message)

  const dias = ventasPorDia(pedidos.data, desde, DIAS)
  const resumen = resumenVentas(dias)
  const top = productosMasVendidos(items.data)

  const stats = [
    { label: 'Ingresos', value: formatearPrecio(resumen.ingresos) },
    { label: 'Pedidos', value: resumen.pedidos },
    { label: 'Ticket promedio', value: formatearPrecio(resumen.ticketPromedio) },
    { label: 'Mejor día', value: resumen.mejorDia ? diaCorto(resumen.mejorDia.fecha) : '—' },
  ]

  return (
    <div className="max-w-5xl p-8">
      <AdminHeader titulo="Analíticas" />
      <p className="-mt-6 mb-8 text-sm text-gray-500">
        Últimos {DIAS} días · pedidos cancelados y reembolsados excluidos
      </p>

      <dl className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <dt className="mb-1 text-xs text-gray-500">{s.label}</dt>
            <dd className="text-2xl font-bold text-gray-900 tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      <Card className="mb-8">
        <CardHeader titulo="Ingresos diarios" />
        <div className="p-6">
          {resumen.ingresos === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">Sin ventas en este período.</p>
          ) : (
            <GraficoIngresos dias={dias} />
          )}
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <CardHeader titulo="Productos más vendidos" />
        {top.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">Sin datos aún.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs tracking-wide text-gray-500 uppercase">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">
                  #
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  Producto
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Unidades
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Ingresos
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {top.map((p, i) => (
                <tr key={p.nombre} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{i + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{p.nombre}</td>
                  <td className="px-6 py-4 text-right text-gray-700 tabular-nums">{p.cantidad}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900 tabular-nums">
                    {formatearPrecio(p.ingresos)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
