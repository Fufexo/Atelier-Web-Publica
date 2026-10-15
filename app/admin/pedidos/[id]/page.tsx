import { notFound } from 'next/navigation'
import BotonEnviar from '@/components/admin/BotonEnviar'
import { AdminHeader, Card, CardHeader, EstadoPagoBadge, EstadoPedidoBadge } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/auth'
import { formatearFecha, formatearPrecio, numeroPedido } from '@/lib/format'
import { ESTADO_PEDIDO, ESTADOS_PEDIDO } from '@/lib/pedidos'
import { parsearDireccion } from '@/lib/types'
import { actualizarEstadoPedido } from '../actions'

export const metadata = { title: 'Detalle de pedido' }

export default async function DetallePedidoPage({ params }: PageProps<'/admin/pedidos/[id]'>) {
  const { id } = await params
  const { supabase } = await requireAdmin()

  const { data: pedido } = await supabase
    .from('pedidos')
    .select('*, items_pedido(*), pagos(*)')
    .eq('id', id)
    .maybeSingle()
  if (!pedido) notFound()

  const dir = parsearDireccion(pedido.direccion_envio)

  return (
    <div className="max-w-5xl p-8">
      <AdminHeader
        titulo={
          <span className="flex items-center gap-3">
            Pedido {numeroPedido(pedido.numero)} <EstadoPedidoBadge estado={pedido.estado} />
          </span>
        }
        volver={{ href: '/admin/pedidos', label: 'Pedidos' }}
      >
        <p className="text-sm text-gray-500">{formatearFecha(pedido.created_at)}</p>
      </AdminHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader titulo="Productos" />
            <ul className="divide-y divide-gray-100">
              {pedido.items_pedido.map((item) => (
                <li key={item.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.nombre_producto}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {[item.talla, item.color].filter(Boolean).join(' · ')} · x{item.cantidad}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatearPrecio(item.subtotal ?? item.precio_unitario * item.cantidad)}
                    </p>
                    <p className="text-xs text-gray-500">{formatearPrecio(item.precio_unitario)} c/u</p>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="space-y-1 border-t border-gray-100 px-6 py-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <dt>Subtotal (sin IGV)</dt>
                <dd>{formatearPrecio(pedido.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-gray-600">
                <dt>IGV (18%)</dt>
                <dd>{formatearPrecio(pedido.igv)}</dd>
              </div>
              <div className="flex justify-between text-gray-600">
                <dt>Envío</dt>
                <dd>{formatearPrecio(pedido.costo_envio)}</dd>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-gray-900">
                <dt>Total</dt>
                <dd>{formatearPrecio(pedido.total)}</dd>
              </div>
            </dl>
          </Card>

          {pedido.pagos.length > 0 && (
            <Card>
              <CardHeader titulo="Pago" />
              {pedido.pagos.map((pago) => (
                <dl key={pago.id} className="space-y-2 px-6 py-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Estado</dt>
                    <dd>
                      <EstadoPagoBadge estado={pago.estado} />
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Método</dt>
                    <dd className="font-medium capitalize">{pago.metodo ?? '—'}</dd>
                  </div>
                  {pago.marca_tarjeta && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Tarjeta</dt>
                      <dd className="capitalize">
                        {pago.marca_tarjeta} •••• {pago.ultimos_4_digitos}
                      </dd>
                    </div>
                  )}
                  {pago.culqi_charge_id && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">ID Culqi</dt>
                      <dd className="font-mono text-xs">{pago.culqi_charge_id}</dd>
                    </div>
                  )}
                  {pago.error_mensaje && <p className="mt-2 text-xs text-red-600">{pago.error_mensaje}</p>}
                </dl>
              ))}
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Comprador</h2>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{pedido.nombre_comprador}</p>
              <p>
                <a href={`mailto:${pedido.email_comprador}`} className="text-gray-600 hover:underline">
                  {pedido.email_comprador}
                </a>
              </p>
              {pedido.telefono_comprador && (
                <p>
                  <a href={`tel:${pedido.telefono_comprador}`} className="text-gray-600 hover:underline">
                    {pedido.telefono_comprador}
                  </a>
                </p>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Dirección de envío</h2>
            <address className="space-y-0.5 text-sm text-gray-600 not-italic">
              <p className="font-medium text-gray-900">{dir.nombre_destinatario}</p>
              <p>{dir.direccion}</p>
              {dir.referencia && <p className="text-gray-500">{dir.referencia}</p>}
              <p>
                {dir.distrito}, {dir.provincia}
              </p>
              <p>{dir.departamento}</p>
              <p className="mt-1">{dir.telefono}</p>
            </address>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Actualizar estado</h2>
            <ul className="space-y-2">
              {ESTADOS_PEDIDO.map((e) => {
                const actual = pedido.estado === e
                return (
                  <li key={e}>
                    <form action={actualizarEstadoPedido.bind(null, pedido.id, e)}>
                      <BotonEnviar
                        disabled={actual}
                        aria-current={actual ? 'true' : undefined}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                          actual
                            ? 'cursor-default bg-gray-50 font-semibold ring-2 ring-slate-400 ring-offset-1'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span
                          className={`inline-block size-2 shrink-0 rounded-full ${ESTADO_PEDIDO[e].dot}`}
                        />
                        {ESTADO_PEDIDO[e].label}
                        {actual && <span className="ml-auto text-xs text-gray-500">actual</span>}
                      </BotonEnviar>
                    </form>
                  </li>
                )
              })}
            </ul>
          </Card>

          {pedido.notas && (
            <Card className="p-5">
              <h2 className="mb-2 text-sm font-semibold text-gray-900">Notas</h2>
              <p className="text-sm text-gray-600">{pedido.notas}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
