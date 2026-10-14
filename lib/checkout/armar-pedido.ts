import { DESTINO_PROVINCIA, costoEnvio } from '@/lib/envios'
import { calcularTotales, precioFinal, redondear, type Totales } from '@/lib/precios'
import type { DireccionEnvio } from '@/lib/types'
import type { SolicitudCobro } from './schema'

/** Variante tal como está en la base, con su producto. */
export interface VarianteEnBase {
  id: string
  talla: string | null
  color: string | null
  stock: number
  activa: boolean
  productos: {
    id: string
    nombre: string
    precio: number
    precio_oferta: number | null
    activo: boolean
  } | null
}

export interface LineaPedido {
  varianteId: string
  productoId: string
  nombre: string
  talla: string | null
  color: string | null
  precioUnitario: number
  cantidad: number
}

export type ResultadoPedido =
  | { ok: true; lineas: LineaPedido[]; totales: Totales; direccion: DireccionEnvio }
  | { ok: false; status: 409 | 422; error: string }

/** Diferencia tolerada entre el total mostrado y el calculado (redondeos). */
const TOLERANCIA = 0.01

/**
 * Arma el pedido con los precios y el stock reales. Función pura: no consulta la
 * base ni cobra, solo decide si la compra es válida y cuánto cuesta.
 */
export function armarPedido(solicitud: SolicitudCobro, variantes: VarianteEnBase[]): ResultadoPedido {
  const porId = new Map(variantes.map((v) => [v.id, v]))
  const lineas: LineaPedido[] = []

  for (const item of solicitud.items) {
    const variante = porId.get(item.varianteId)
    const producto = variante?.productos
    if (!variante || !producto || !variante.activa || !producto.activo) {
      return {
        ok: false,
        status: 409,
        error: 'Uno de los productos de tu carrito ya no está disponible. Revisa tu carrito.',
      }
    }
    if (variante.stock < item.cantidad) {
      return {
        ok: false,
        status: 409,
        error: `Solo quedan ${variante.stock} unidades de ${producto.nombre}. Ajusta tu carrito.`,
      }
    }
    lineas.push({
      varianteId: variante.id,
      productoId: producto.id,
      nombre: producto.nombre,
      talla: variante.talla,
      color: variante.color,
      precioUnitario: precioFinal(producto),
      cantidad: item.cantidad,
    })
  }

  const envio = costoEnvio(solicitud.envio.destino)
  if (envio === null) return { ok: false, status: 422, error: 'Selecciona un distrito válido.' }

  const totalProductos = redondear(lineas.reduce((s, l) => s + l.precioUnitario * l.cantidad, 0))
  const totales = calcularTotales(totalProductos, envio)

  if (Math.abs(totales.total - solicitud.totalEsperado) > TOLERANCIA) {
    return {
      ok: false,
      status: 409,
      error: 'Los precios de tu carrito cambiaron. Revisa el resumen antes de pagar.',
    }
  }

  const esProvincia = solicitud.envio.destino === DESTINO_PROVINCIA
  const departamento = esProvincia ? solicitud.envio.departamento! : 'Lima'
  return {
    ok: true,
    lineas,
    totales,
    direccion: {
      nombre_destinatario: solicitud.cliente.nombre,
      telefono: solicitud.cliente.telefono,
      departamento,
      provincia: esProvincia ? solicitud.envio.ciudad! : 'Lima',
      distrito: esProvincia ? solicitud.envio.ciudad! : solicitud.envio.destino,
      direccion: solicitud.envio.direccion,
      referencia: solicitud.envio.referencia || undefined,
    },
  }
}
