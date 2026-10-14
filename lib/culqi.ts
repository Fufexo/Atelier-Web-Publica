import 'server-only'
import { aCentimos } from '@/lib/precios'

const API = 'https://api.culqi.com/v2'

interface CargoCulqi {
  id: string
  source?: { card_number?: string; iin?: { card_brand?: string } }
}

interface ErrorCulqi {
  object: 'error'
  user_message?: string
  merchant_message?: string
}

export type ResultadoCargo =
  { ok: true; cargo: CargoCulqi; respuesta: unknown } | { ok: false; mensaje: string }

async function llamar(ruta: string, cuerpo: unknown) {
  const res = await fetch(`${API}${ruta}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CULQI_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cuerpo),
    signal: AbortSignal.timeout(20_000),
  })
  const datos: unknown = await res.json().catch(() => null)
  return { ok: res.ok, datos }
}

function esError(datos: unknown): datos is ErrorCulqi {
  return typeof datos === 'object' && datos !== null && (datos as ErrorCulqi).object === 'error'
}

export async function crearCargo(params: {
  token: string
  monto: number
  email: string
  nombre: string
  telefono: string
  direccion: string
  ciudad: string
}): Promise<ResultadoCargo> {
  const [nombre, ...apellidos] = params.nombre.split(/\s+/)
  const { ok, datos } = await llamar('/charges', {
    amount: aCentimos(params.monto),
    currency_code: 'PEN',
    email: params.email,
    source_id: params.token,
    description: 'Compra ATELIER',
    antifraud_details: {
      first_name: nombre,
      last_name: apellidos.join(' ') || nombre,
      phone_number: params.telefono,
      address: params.direccion,
      address_city: params.ciudad,
      country_code: 'PE',
    },
  })

  if (!ok || esError(datos) || typeof (datos as CargoCulqi)?.id !== 'string') {
    const mensaje = esError(datos) ? datos.user_message : undefined
    return { ok: false, mensaje: mensaje ?? 'No se pudo procesar el pago. Intenta con otra tarjeta.' }
  }
  return { ok: true, cargo: datos as CargoCulqi, respuesta: datos }
}

/** Devuelve el dinero de un cargo cuando no se pudo registrar el pedido. */
export async function reembolsarCargo(cargoId: string, monto: number): Promise<boolean> {
  const { ok } = await llamar('/refunds', {
    amount: aCentimos(monto),
    charge_id: cargoId,
    reason: 'solicitud_comprador',
  })
  return ok
}
