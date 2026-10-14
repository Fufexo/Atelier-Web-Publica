import Link from 'next/link'
import { AdminHeader, Card, CardHeader, EstadoPedidoBadge } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/auth'
import { formatearFecha, formatearPrecio, inicioDelDiaEnLima, numeroPedido } from '@/lib/format'
import { ESTADOS_SIN_VENTA } from '@/lib/pedidos'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const { supabase } = await requireAdmin()

  const [productos, activos, recientes, hoy] = await Promise.all([
    supabase.from('productos').select('*', { count: 'exact', head: true }),
    supabase.from('productos').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase
      .from('pedidos')
      .select('id, numero, nombre_comprador, total, estado, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    // "Hoy" es el día en Lima, no en UTC (el servidor de Vercel corre en UTC).
    supabase.from('pedidos').select('total, estado').gte('created_at', inicioDelDiaEnLima()),
  ])

  const ventasHoy = (hoy.data ?? [])
    .filter((p) => !ESTADOS_SIN_VENTA.includes(p.estado))
    .reduce((sum, p) => sum + Number(p.total), 0)

  const stats = [
    {
      label: 'Productos activos',
      value: `${activos.count ?? 0} / ${productos.count ?? 0}`,
      href: '/admin/productos',
      color: 'text-blue-700',
    },
    { label: 'Pedidos hoy', value: hoy.data?.length ?? 0, href: '/admin/pedidos', color: 'text-purple-700' },
    {
      label: 'Ventas hoy',
      value: formatearPrecio(ventasHoy),
      href: '/admin/analiticas',
      color: 'text-green-700',
    },
  ]

  return (
    <div className="p-8">
      <AdminHeader titulo="Dashboard" />

      <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-sm"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader titulo="Pedidos recientes">
          <Link href="/admin/pedidos" className="text-sm text-slate-600 hover:underline">
            Ver todos →
          </Link>
        </CardHeader>

        {!recientes.data?.length ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">Aún no hay pedidos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs tracking-wide text-gray-500 uppercase">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left">
                    N°
                  </th>
                  <th scope="col" className="px-6 py-3 text-left">
                    Comprador
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recientes.data.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">
                      <Link href={`/admin/pedidos/${pedido.id}`} className="hover:underline">
                        {numeroPedido(pedido.numero)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{pedido.nombre_comprador}</td>
                    <td className="px-6 py-4 font-medium">{formatearPrecio(pedido.total)}</td>
                    <td className="px-6 py-4">
                      <EstadoPedidoBadge estado={pedido.estado} />
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatearFecha(pedido.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
