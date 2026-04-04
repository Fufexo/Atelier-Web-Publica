import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { enviarConfirmacionPedido, enviarNotificacionAdmin } from '@/lib/email'

interface ItemBody {
  varianteId: string
  productoId: string
  nombre: string
  precio: number
  cantidad: number
  talla: string | null
  color: string | null
}

interface Body {
  token: string
  nombre: string
  email: string
  telefono: string
  departamento: string
  provincia: string
  distrito: string
  direccion: string
  referencia: string
  items: ItemBody[]
  subtotal: number
  igv: number
  total: number
}

export async function POST(req: NextRequest) {
  const body: Body = await req.json()
  const {
    token, nombre, email, telefono,
    departamento, provincia, distrito, direccion, referencia,
    items, subtotal, igv, total,
  } = body

  // 1. Crear cargo en Culqi (monto en centavos)
  const monto = Math.round(total * 100)

  const culqiRes = await fetch('https://api.culqi.com/v2/charges', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CULQI_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: monto,
      currency_code: 'PEN',
      email,
      source_id: token,
      description: 'Compra ATELIER',
      metadata: { nombre, telefono },
      antifraud_details: {
        first_name: nombre.split(' ')[0] ?? nombre,
        last_name: nombre.split(' ').slice(1).join(' ') || nombre,
        phone_number: telefono,
        address: direccion,
        address_city: distrito,
        country_code: 'PE',
      },
    }),
  })

  const culqiData = await culqiRes.json()

  if (!culqiRes.ok || culqiData.object === 'error') {
    return NextResponse.json(
      { error: culqiData.user_message ?? 'Error al procesar el pago' },
      { status: 402 }
    )
  }

  // 2. Crear pedido (service role — bypasa RLS)
  const supabase = createAdminClient()

  const { data: pedido, error: errPedido } = await supabase
    .from('pedidos')
    .insert({
      nombre_comprador: nombre,
      email_comprador: email,
      telefono_comprador: telefono,
      direccion_envio: {
        nombre_destinatario: nombre,
        telefono,
        departamento,
        provincia,
        distrito,
        direccion,
        referencia: referencia || undefined,
      },
      subtotal,
      igv,
      costo_envio: 0,
      total,
      estado: 'pagado',
    })
    .select('id, numero')
    .single()

  if (errPedido || !pedido) {
    console.error('Error creando pedido tras cobro exitoso:', errPedido)
    return NextResponse.json(
      { error: 'Pago procesado pero hubo un error guardando el pedido. Contacta soporte.' },
      { status: 500 }
    )
  }

  // 3. Insertar items
  await supabase.from('items_pedido').insert(
    items.map((item) => ({
      pedido_id: pedido.id,
      producto_id: item.productoId,
      variante_id: item.varianteId,
      nombre_producto: item.nombre,
      talla: item.talla,
      color: item.color,
      precio_unitario: item.precio,
      cantidad: item.cantidad,
    }))
  )

  // 4. Descontar stock de cada variante
  for (const item of items) {
    const { error: errStock } = await supabase.rpc('descontar_stock', {
      p_variante_id: item.varianteId,
      p_cantidad: item.cantidad,
    })
    if (errStock) console.error('Stock error:', errStock.message)
  }

  // 5. Registrar pago
  await supabase.from('pagos').insert({
    pedido_id: pedido.id,
    estado: 'completado',
    metodo: 'tarjeta',
    culqi_charge_id: culqiData.id,
    culqi_token_id: token,
    monto: total,
    moneda: 'PEN',
    ultimos_4_digitos: culqiData.source?.card_number?.slice(-4) ?? null,
    marca_tarjeta: culqiData.source?.brand ?? null,
    respuesta_culqi: culqiData,
  })

  // 6. Enviar emails (no bloqueante — un fallo de email no rompe la respuesta)
  const itemsEmail = items.map((item) => ({
    nombre_producto: item.nombre,
    talla: item.talla,
    color: item.color,
    cantidad: item.cantidad,
    precio_unitario: item.precio,
    subtotal: item.precio * item.cantidad,
  }))

  const pedidoEmail = {
    numero: pedido.numero,
    nombre_comprador: nombre,
    email_comprador: email,
    items: itemsEmail,
    subtotal,
    igv,
    costo_envio: 0,
    total,
    direccion: { direccion, distrito, provincia, departamento, referencia },
  }

  Promise.all([
    enviarConfirmacionPedido(pedidoEmail),
    enviarNotificacionAdmin(pedidoEmail),
  ]).catch((err) => console.error('Error enviando emails:', err))

  return NextResponse.json({ numero: pedido.numero })
}
