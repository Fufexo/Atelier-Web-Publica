/** Tasa del IGV en Perú. Los precios de la tienda ya lo incluyen. */
export const IGV = 0.18

/** Redondea a céntimos evitando errores de coma flotante (0.1 + 0.2). */
export function redondear(monto: number): number {
  return Math.round((monto + Number.EPSILON) * 100) / 100
}

export interface Totales {
  /** Base imponible: productos sin IGV. */
  subtotal: number
  igv: number
  envio: number
  total: number
}

/**
 * Desglosa el total de un pedido. `totalProductos` incluye IGV (es lo que
 * suman los precios de la tienda); el envío se suma aparte.
 */
export function calcularTotales(totalProductos: number, envio = 0): Totales {
  const subtotal = redondear(totalProductos / (1 + IGV))
  return {
    subtotal,
    igv: redondear(totalProductos - subtotal),
    envio: redondear(envio),
    total: redondear(totalProductos + envio),
  }
}

/** Precio que paga el cliente: la oferta si existe, si no el precio normal. */
export function precioFinal(producto: { precio: number; precio_oferta: number | null }): number {
  return producto.precio_oferta ?? producto.precio
}

/** Culqi trabaja en céntimos. */
export function aCentimos(monto: number): number {
  return Math.round(monto * 100)
}
