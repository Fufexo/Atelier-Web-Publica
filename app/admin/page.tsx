import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatearPrecio, formatearFecha, ESTADO_PEDIDO_COLORS, ESTADO_PEDIDO_LABELS } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalProductos },
    { count: productosActivos },
    { data: pedidosRecientes },
    { data: pedidosHoy },
  ] = await Promise.all([
    supabase.from('productos').select('*', { count: 'exact', head: true }),
    supabase.from('productos').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('pedidos')
      .select('total, estado')
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ])

  const ventasHoy = pedidosHoy
    ?.filter(p => p.estado !== 'cancelado' && p.estado !== 'reembolsado')
    .reduce((sum, p) => sum + Number(p.total), 0) ?? 0

  const stats = [
    {
      label: 'Productos activos',
      value: `${productosActivos ?? 0} / ${totalProductos ?? 0}`,
      href: '/admin/productos',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Pedidos hoy',
      value: pedidosHoy?.length ?? 0,
      href: '/admin/pedidos',
      color: 'bg-purple-50 text-purple-700',
    },
    {
      label: 'Ventas hoy',
      value: formatearPrecio(ventasHoy),
      href: '/admin/pedidos',
      color: 'bg-green-50 text-green-700',
    },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color.split(' ')[1]}`}>
                {stat.value}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Pedidos recientes */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Pedidos recientes</h2>
          <Link href="/admin/pedidos" className="text-sm text-slate-600 hover:underline">
            Ver todos →
          </Link>
        </div>

        {!pedidosRecientes?.length ? (
          <p className="px-6 py-8 text-sm text-gray-400 text-center">
            Aún no hay pedidos.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-6 py-3 text-left">N°</th>
                <th className="px-6 py-3 text-left">Comprador</th>
                <th className="px-6 py-3 text-left">Total</th>
                <th className="px-6 py-3 text-left">Estado</th>
                <th className="px-6 py-3 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pedidosRecientes.map((pedido) => (
                <tr key={pedido.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">#{pedido.numero}</td>
                  <td className="px-6 py-4 text-gray-600">{pedido.nombre_comprador}</td>
                  <td className="px-6 py-4 font-medium">{formatearPrecio(pedido.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_PEDIDO_COLORS[pedido.estado]}`}>
                      {ESTADO_PEDIDO_LABELS[pedido.estado]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{formatearFecha(pedido.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
