import { createClient } from '@/lib/supabase/server'
import { formatearPrecio } from '@/lib/utils'

export const metadata = { title: 'Analíticas — Admin' }

function formatDay(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

export default async function AnaliticasPage() {
  const supabase = await createClient()

  const hace30 = new Date()
  hace30.setDate(hace30.getDate() - 29)
  hace30.setHours(0, 0, 0, 0)

  const [{ data: pedidos }, { data: items }] = await Promise.all([
    supabase
      .from('pedidos')
      .select('total, estado, created_at')
      .gte('created_at', hace30.toISOString())
      .not('estado', 'in', '("cancelado","reembolsado")'),
    supabase
      .from('items_pedido')
      .select('nombre_producto, cantidad, subtotal, pedidos!inner(estado)')
      .not('pedidos.estado', 'in', '("cancelado","reembolsado")'),
  ])

  // Ventas por día (últimos 30 días)
  const diasMap: Record<string, { revenue: number; orders: number }> = {}
  for (let i = 0; i < 30; i++) {
    const d = new Date(hace30)
    d.setDate(d.getDate() + i)
    diasMap[d.toISOString().slice(0, 10)] = { revenue: 0, orders: 0 }
  }
  for (const p of pedidos ?? []) {
    const dia = p.created_at.slice(0, 10)
    if (diasMap[dia]) {
      diasMap[dia].revenue += Number(p.total)
      diasMap[dia].orders += 1
    }
  }
  const dias = Object.entries(diasMap).map(([date, v]) => ({ date, ...v }))

  // Stats del período
  const revenueTotal = dias.reduce((s, d) => s + d.revenue, 0)
  const ordersTotal = dias.reduce((s, d) => s + d.orders, 0)
  const avgOrder = ordersTotal > 0 ? revenueTotal / ordersTotal : 0
  const mejorDia = dias.reduce((best, d) => d.revenue > best.revenue ? d : best, dias[0])

  // Productos más vendidos
  const productosMap: Record<string, { cantidad: number; revenue: number }> = {}
  for (const item of items ?? []) {
    if (!productosMap[item.nombre_producto]) {
      productosMap[item.nombre_producto] = { cantidad: 0, revenue: 0 }
    }
    productosMap[item.nombre_producto].cantidad += item.cantidad
    productosMap[item.nombre_producto].revenue += Number(item.subtotal)
  }
  const topProductos = Object.entries(productosMap)
    .map(([nombre, v]) => ({ nombre, ...v }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10)

  // SVG chart
  const maxRevenue = Math.max(...dias.map((d) => d.revenue), 1)
  const chartW = 720
  const chartH = 140
  const barW = Math.floor((chartW - 60) / dias.length) - 2
  const barSpacing = Math.floor((chartW - 60) / dias.length)

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Analíticas</h1>
      <p className="text-sm text-gray-400 mb-8">Últimos 30 días</p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Ingresos', value: formatearPrecio(revenueTotal), color: 'text-green-600' },
          { label: 'Pedidos', value: ordersTotal, color: 'text-blue-600' },
          { label: 'Ticket promedio', value: formatearPrecio(avgOrder), color: 'text-purple-600' },
          { label: 'Mejor día', value: mejorDia?.revenue > 0 ? formatDay(mejorDia.date) : '—', color: 'text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Gráfico de barras */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-6">Ingresos diarios</h2>
        {revenueTotal === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">Sin datos en este período.</p>
        ) : (
          <div className="overflow-x-auto">
            <svg width={chartW} height={chartH + 30} className="block">
              {/* Líneas guía */}
              {[0.25, 0.5, 0.75, 1].map((pct) => (
                <line
                  key={pct}
                  x1={50} y1={chartH - chartH * pct}
                  x2={chartW} y2={chartH - chartH * pct}
                  stroke="#f3f4f6" strokeWidth={1}
                />
              ))}
              {/* Barras */}
              {dias.map((d, i) => {
                const h = maxRevenue > 0 ? Math.max((d.revenue / maxRevenue) * chartH, d.revenue > 0 ? 2 : 0) : 0
                const x = 50 + i * barSpacing
                const y = chartH - h
                return (
                  <g key={d.date}>
                    <rect
                      x={x} y={y} width={barW} height={h}
                      fill={d.revenue > 0 ? '#1e293b' : '#f1f5f9'}
                      rx={2}
                    />
                    {/* Label día cada 5 */}
                    {i % 5 === 0 && (
                      <text x={x + barW / 2} y={chartH + 18} textAnchor="middle" fontSize={10} fill="#9ca3af">
                        {formatDay(d.date)}
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Productos más vendidos */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Productos más vendidos</h2>
        </div>
        {topProductos.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-400 text-center">Sin datos aún.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-6 py-3 text-left">#</th>
                <th className="px-6 py-3 text-left">Producto</th>
                <th className="px-6 py-3 text-right">Unidades vendidas</th>
                <th className="px-6 py-3 text-right">Ingresos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topProductos.map((p, i) => (
                <tr key={p.nombre} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-400 font-mono text-xs">{i + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{p.nombre}</td>
                  <td className="px-6 py-4 text-right text-gray-700">{p.cantidad}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">{formatearPrecio(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
