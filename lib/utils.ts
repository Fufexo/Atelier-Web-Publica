export function generarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function formatearPrecio(monto: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(monto)
}

export function formatearFecha(fecha: string): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(fecha))
}

export const ESTADO_PEDIDO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  preparando: 'Preparando',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
  reembolsado: 'Reembolsado',
}

export const ESTADO_PEDIDO_COLORS: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  pagado: 'bg-blue-100 text-blue-800',
  preparando: 'bg-purple-100 text-purple-800',
  enviado: 'bg-indigo-100 text-indigo-800',
  entregado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
  reembolsado: 'bg-gray-100 text-gray-800',
}
