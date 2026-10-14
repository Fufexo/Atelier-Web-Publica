import { diaEnLima } from './format'

export interface DiaVentas {
  /** `YYYY-MM-DD` en hora de Lima. */
  fecha: string
  ingresos: number
  pedidos: number
}

/**
 * Agrupa pedidos por día de Lima, incluyendo los días sin ventas.
 * `desde` es el instante en que empieza el primer día (ver `inicioDelDiaEnLima`).
 */
export function ventasPorDia(
  pedidos: { total: number; created_at: string }[],
  desde: string,
  dias: number
): DiaVentas[] {
  const porDia = new Map<string, DiaVentas>()
  const inicio = new Date(desde).getTime()
  for (let i = 0; i < dias; i++) {
    const fecha = diaEnLima(new Date(inicio + i * 86_400_000))
    porDia.set(fecha, { fecha, ingresos: 0, pedidos: 0 })
  }
  for (const p of pedidos) {
    const dia = porDia.get(diaEnLima(p.created_at))
    if (!dia) continue
    dia.ingresos += Number(p.total)
    dia.pedidos += 1
  }
  return [...porDia.values()]
}

export function resumenVentas(dias: DiaVentas[]) {
  const ingresos = dias.reduce((s, d) => s + d.ingresos, 0)
  const pedidos = dias.reduce((s, d) => s + d.pedidos, 0)
  const mejorDia = dias.reduce<DiaVentas | null>(
    (mejor, d) => (d.ingresos > (mejor?.ingresos ?? 0) ? d : mejor),
    null
  )
  return { ingresos, pedidos, ticketPromedio: pedidos > 0 ? ingresos / pedidos : 0, mejorDia }
}

export function productosMasVendidos(
  items: { nombre_producto: string; cantidad: number; precio_unitario: number }[],
  limite = 10
) {
  const porNombre = new Map<string, { nombre: string; cantidad: number; ingresos: number }>()
  for (const item of items) {
    const p = porNombre.get(item.nombre_producto) ?? {
      nombre: item.nombre_producto,
      cantidad: 0,
      ingresos: 0,
    }
    p.cantidad += item.cantidad
    p.ingresos += item.precio_unitario * item.cantidad
    porNombre.set(item.nombre_producto, p)
  }
  return [...porNombre.values()]
    .sort((a, b) => b.cantidad - a.cantidad || b.ingresos - a.ingresos)
    .slice(0, limite)
}

/** "14/10" a partir de "2026-10-14". */
export function diaCorto(fecha: string): string {
  const [, m, d] = fecha.split('-')
  return `${Number(d)}/${Number(m)}`
}
