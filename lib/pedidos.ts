import type { EstadoPago, EstadoPedido } from './types'

export const ESTADOS_PEDIDO: readonly EstadoPedido[] = [
  'pendiente',
  'pagado',
  'preparando',
  'enviado',
  'entregado',
  'cancelado',
  'reembolsado',
]

/** Estados que no cuentan como venta en el dashboard ni en analíticas. */
export const ESTADOS_SIN_VENTA: readonly EstadoPedido[] = ['cancelado', 'reembolsado']

interface Presentacion {
  label: string
  /** Clases del badge. */
  badge: string
  /** Clase del punto de color en el selector de estado. */
  dot: string
}

export const ESTADO_PEDIDO: Record<EstadoPedido, Presentacion> = {
  pendiente: { label: 'Pendiente', badge: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-400' },
  pagado: { label: 'Pagado', badge: 'bg-blue-100 text-blue-800', dot: 'bg-blue-400' },
  preparando: { label: 'Preparando', badge: 'bg-purple-100 text-purple-800', dot: 'bg-purple-400' },
  enviado: { label: 'Enviado', badge: 'bg-indigo-100 text-indigo-800', dot: 'bg-indigo-400' },
  entregado: { label: 'Entregado', badge: 'bg-green-100 text-green-800', dot: 'bg-green-400' },
  cancelado: { label: 'Cancelado', badge: 'bg-red-100 text-red-800', dot: 'bg-red-400' },
  reembolsado: { label: 'Reembolsado', badge: 'bg-gray-100 text-gray-800', dot: 'bg-gray-400' },
}

export const ESTADO_PAGO: Record<EstadoPago, Omit<Presentacion, 'dot'>> = {
  pendiente: { label: 'Pendiente', badge: 'bg-yellow-100 text-yellow-800' },
  completado: { label: 'Completado', badge: 'bg-green-100 text-green-800' },
  fallido: { label: 'Fallido', badge: 'bg-red-100 text-red-800' },
  reembolsado: { label: 'Reembolsado', badge: 'bg-gray-100 text-gray-800' },
}

export function esEstadoPedido(valor: string): valor is EstadoPedido {
  return (ESTADOS_PEDIDO as readonly string[]).includes(valor)
}

/** Umbral a partir del cual el admin ve la alerta de stock bajo. */
export const STOCK_BAJO = 5

export function calcularStockTotal(variantes: { stock: number }[] | null | undefined): number {
  return variantes?.reduce((sum, v) => sum + v.stock, 0) ?? 0
}
