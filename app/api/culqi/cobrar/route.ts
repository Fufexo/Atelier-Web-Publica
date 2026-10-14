import { after, NextResponse, type NextRequest } from 'next/server'
import { armarPedido, type VarianteEnBase } from '@/lib/checkout/armar-pedido'
import { solicitudCobroSchema } from '@/lib/checkout/schema'
import { crearCargo, reembolsarCargo } from '@/lib/culqi'
import { enviarEmailsPedido } from '@/lib/email'
import { precioFinal } from '@/lib/precios'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Json } from '@/lib/supabase/database.types'

/**
 * Cobra un pedido con Culqi y lo registra.
 *
 * 1. Valida la solicitud (qué variantes, cuántas, a qué distrito).
 * 2. Calcula precios, envío y total desde la base: nunca confía en montos del cliente.
 * 3. Cobra ese total.
 * 4. Registra pedido, ítems, stock y pago en una sola transacción (RPC).
 *    Si eso falla, reembolsa el cargo para no cobrar un pedido inexistente.
 * 5. Envía los emails después de responder.
 */
export async function POST(req: NextRequest) {
  const cuerpo: unknown = await req.json().catch(() => null)
  const parsed = solicitudCobroSchema.safeParse(cuerpo)
  if (!parsed.success) {
    const primero = parsed.error.issues[0]
    return NextResponse.json(
      { error: primero?.message ?? 'Revisa los datos del formulario.', campo: primero?.path.join('.') },
      { status: 422 }
    )
  }
  const solicitud = parsed.data
  const supabase = createAdminClient()

  const { data: variantes, error: errVariantes } = await supabase
    .from('variantes')
    .select('id, talla, color, stock, activa, productos(id, nombre, precio, precio_oferta, activo)')
    .in(
      'id',
      solicitud.items.map((i) => i.varianteId)
    )

  if (errVariantes) {
    console.error('[cobrar] Error leyendo variantes', errVariantes)
    return NextResponse.json({ error: 'No pudimos verificar tu carrito. Intenta de nuevo.' }, { status: 503 })
  }

  const pedido = armarPedido(solicitud, variantes as VarianteEnBase[])
  if (!pedido.ok) {
    // Se devuelven precio y stock actuales para que el carrito se corrija solo.
    const carrito = (variantes as VarianteEnBase[]).map((v) => ({
      varianteId: v.id,
      precio: v.productos ? precioFinal(v.productos) : null,
      stock: v.activa && v.productos?.activo ? v.stock : 0,
    }))
    return NextResponse.json({ error: pedido.error, carrito }, { status: pedido.status })
  }

  const { cliente } = solicitud
  const { totales, lineas, direccion } = pedido

  const cargo = await crearCargo({
    token: solicitud.token,
    monto: totales.total,
    email: cliente.email,
    nombre: cliente.nombre,
    telefono: cliente.telefono,
    direccion: direccion.direccion,
    ciudad: direccion.distrito,
  })
  if (!cargo.ok) return NextResponse.json({ error: cargo.mensaje }, { status: 402 })

  const { id: cargoId, source } = cargo.cargo
  const { data: registrado, error: errRegistro } = await supabase
    .rpc('registrar_pedido_pagado', {
      p_pedido: {
        nombre_comprador: cliente.nombre,
        email_comprador: cliente.email,
        telefono_comprador: cliente.telefono,
        direccion_envio: { ...direccion } as Json,
        subtotal: totales.subtotal,
        igv: totales.igv,
        costo_envio: totales.envio,
        total: totales.total,
      },
      p_items: lineas.map((l) => ({
        variante_id: l.varianteId,
        producto_id: l.productoId,
        nombre_producto: l.nombre,
        talla: l.talla,
        color: l.color,
        precio_unitario: l.precioUnitario,
        cantidad: l.cantidad,
      })),
      p_pago: {
        culqi_charge_id: cargoId,
        culqi_token_id: solicitud.token,
        monto: totales.total,
        ultimos_4_digitos: source?.card_number?.slice(-4) ?? null,
        marca_tarjeta: source?.iin?.card_brand ?? null,
        respuesta_culqi: cargo.respuesta as Json,
      },
    })
    .single()

  if (errRegistro || !registrado) {
    console.error('[cobrar] Cargo cobrado pero el pedido no se registró', { cargoId, errRegistro })
    const reembolsado = await reembolsarCargo(cargoId, totales.total)
    if (!reembolsado) console.error('[cobrar] REEMBOLSO FALLIDO, revisar manualmente en Culqi', { cargoId })
    return NextResponse.json(
      {
        error: reembolsado
          ? 'No pudimos registrar tu pedido y anulamos el cobro. Intenta de nuevo.'
          : 'Tu pago se procesó pero no pudimos registrar el pedido. Escríbenos y lo resolvemos.',
      },
      { status: 500 }
    )
  }

  after(() =>
    enviarEmailsPedido({
      id: registrado.id,
      numero: registrado.numero,
      nombre_comprador: cliente.nombre,
      email_comprador: cliente.email,
      items: lineas.map((l) => ({
        nombre_producto: l.nombre,
        talla: l.talla,
        color: l.color,
        cantidad: l.cantidad,
        subtotal: l.precioUnitario * l.cantidad,
      })),
      subtotal: totales.subtotal,
      igv: totales.igv,
      costo_envio: totales.envio,
      total: totales.total,
      direccion,
    })
  )

  return NextResponse.json({ numero: registrado.numero })
}
