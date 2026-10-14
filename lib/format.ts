/** La tienda opera en Perú: fechas y "hoy" se calculan en hora de Lima, no en la del servidor (UTC en Vercel). */
export const ZONA_HORARIA = 'America/Lima'

const PRECIO = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })

const FECHA_HORA = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: ZONA_HORARIA,
})

const DIA_ISO = new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_HORARIA })

export function formatearPrecio(monto: number): string {
  return PRECIO.format(monto)
}

export function formatearFecha(fecha: string | Date): string {
  return FECHA_HORA.format(new Date(fecha))
}

/** Día calendario en Lima como `YYYY-MM-DD`. */
export function diaEnLima(fecha: string | Date): string {
  return DIA_ISO.format(new Date(fecha))
}

/**
 * Instante (ISO, UTC) en que empezó el día de Lima `diasAtras` días antes de `ahora`.
 * Lima no tiene horario de verano: siempre es UTC-5.
 */
export function inicioDelDiaEnLima(diasAtras = 0, ahora: Date = new Date()): string {
  const [y, m, d] = diaEnLima(ahora).split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d - diasAtras, 5)).toISOString()
}

export function generarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/** Número de pedido legible: 7 → "#0007". */
export function numeroPedido(numero: number | string): string {
  return `#${String(numero).padStart(4, '0')}`
}
