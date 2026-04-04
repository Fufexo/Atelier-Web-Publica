import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface ItemEmail {
  nombre_producto: string
  talla: string | null
  color: string | null
  cantidad: number
  precio_unitario: number
  subtotal: number
}

interface PedidoEmail {
  numero: number
  nombre_comprador: string
  email_comprador: string
  items: ItemEmail[]
  subtotal: number
  igv: number
  costo_envio: number
  total: number
  direccion: {
    direccion: string
    distrito: string
    provincia: string
    departamento: string
    referencia?: string
  }
}

function formatPEN(amount: number) {
  return `S/ ${amount.toFixed(2)}`
}

function itemsHTML(items: ItemEmail[]) {
  return items.map((item) => {
    const variante = [item.talla, item.color].filter(Boolean).join(' · ')
    return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e7e3de;font-size:14px;color:#1c1917;">
          ${item.nombre_producto}
          ${variante ? `<br><span style="font-size:12px;color:#a8a29e;">${variante}</span>` : ''}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #e7e3de;text-align:center;font-size:14px;color:#57534e;">×${item.cantidad}</td>
        <td style="padding:12px 0;border-bottom:1px solid #e7e3de;text-align:right;font-size:14px;color:#1c1917;">${formatPEN(item.subtotal)}</td>
      </tr>`
  }).join('')
}

function baseLayout(contenido: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f2ed;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2ed;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;">
        <!-- Header -->
        <tr>
          <td style="background:#1c1917;padding:32px 40px;text-align:center;">
            <p style="margin:0;color:#ffffff;font-size:22px;letter-spacing:6px;text-transform:uppercase;">ATELIER</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            ${contenido}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f5f2ed;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#a8a29e;letter-spacing:1px;">© ATELIER — Todos los derechos reservados</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function enviarConfirmacionPedido(pedido: PedidoEmail) {
  const dir = pedido.direccion
  const direccionCompleta = [
    dir.direccion,
    dir.referencia,
    `${dir.distrito}, ${dir.provincia}`,
    dir.departamento,
  ].filter(Boolean).join('<br>')

  const html = baseLayout(`
    <h1 style="margin:0 0 8px;font-size:24px;color:#1c1917;font-weight:normal;">Gracias por tu pedido</h1>
    <p style="margin:0 0 32px;font-size:14px;color:#a8a29e;letter-spacing:1px;">Pedido #${pedido.numero}</p>

    <p style="margin:0 0 24px;font-size:15px;color:#44403c;line-height:1.6;">
      Hola ${pedido.nombre_comprador}, recibimos tu pedido y está siendo procesado.
      Te avisaremos cuando sea enviado.
    </p>

    <!-- Productos -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <thead>
        <tr>
          <th style="text-align:left;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a8a29e;padding-bottom:12px;border-bottom:1px solid #e7e3de;font-weight:normal;">Producto</th>
          <th style="text-align:center;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a8a29e;padding-bottom:12px;border-bottom:1px solid #e7e3de;font-weight:normal;">Cant.</th>
          <th style="text-align:right;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a8a29e;padding-bottom:12px;border-bottom:1px solid #e7e3de;font-weight:normal;">Total</th>
        </tr>
      </thead>
      <tbody>${itemsHTML(pedido.items)}</tbody>
    </table>

    <!-- Totales -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="font-size:13px;color:#78716c;padding:4px 0;">Subtotal (sin IGV)</td>
        <td style="font-size:13px;color:#78716c;text-align:right;">${formatPEN(pedido.subtotal)}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#78716c;padding:4px 0;">IGV (18%)</td>
        <td style="font-size:13px;color:#78716c;text-align:right;">${formatPEN(pedido.igv)}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#78716c;padding:4px 0;">Envío</td>
        <td style="font-size:13px;color:#78716c;text-align:right;">${pedido.costo_envio > 0 ? formatPEN(pedido.costo_envio) : 'Por coordinar'}</td>
      </tr>
      <tr>
        <td style="font-size:16px;color:#1c1917;font-weight:bold;padding-top:12px;border-top:1px solid #e7e3de;">Total</td>
        <td style="font-size:16px;color:#1c1917;font-weight:bold;text-align:right;padding-top:12px;border-top:1px solid #e7e3de;">${formatPEN(pedido.total)}</td>
      </tr>
    </table>

    <!-- Dirección -->
    <div style="background:#f5f2ed;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a8a29e;">Dirección de envío</p>
      <p style="margin:0;font-size:14px;color:#44403c;line-height:1.7;">${direccionCompleta}</p>
    </div>

    <p style="margin:0;font-size:13px;color:#a8a29e;line-height:1.6;">
      ¿Tienes alguna consulta? Responde este correo o escríbenos por nuestros canales de atención.
    </p>
  `)

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: pedido.email_comprador,
    subject: `ATELIER — Confirmación de pedido #${pedido.numero}`,
    html,
  })
}

export async function enviarNotificacionAdmin(pedido: PedidoEmail) {
  const html = baseLayout(`
    <h1 style="margin:0 0 8px;font-size:22px;color:#1c1917;font-weight:normal;">Nuevo pedido recibido</h1>
    <p style="margin:0 0 32px;font-size:14px;color:#a8a29e;letter-spacing:1px;">Pedido #${pedido.numero}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="font-size:13px;color:#78716c;padding:6px 0;width:120px;">Cliente</td>
        <td style="font-size:13px;color:#1c1917;">${pedido.nombre_comprador}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#78716c;padding:6px 0;">Email</td>
        <td style="font-size:13px;color:#1c1917;">${pedido.email_comprador}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#78716c;padding:6px 0;">Total</td>
        <td style="font-size:16px;color:#1c1917;font-weight:bold;">${formatPEN(pedido.total)}</td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <thead>
        <tr>
          <th style="text-align:left;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a8a29e;padding-bottom:12px;border-bottom:1px solid #e7e3de;font-weight:normal;">Producto</th>
          <th style="text-align:center;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a8a29e;padding-bottom:12px;border-bottom:1px solid #e7e3de;font-weight:normal;">Cant.</th>
          <th style="text-align:right;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a8a29e;padding-bottom:12px;border-bottom:1px solid #e7e3de;font-weight:normal;">Total</th>
        </tr>
      </thead>
      <tbody>${itemsHTML(pedido.items)}</tbody>
    </table>

    <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/admin/pedidos/${pedido.numero}"
       style="display:inline-block;background:#1c1917;color:#ffffff;padding:12px 28px;font-size:12px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;">
      Ver pedido en admin
    </a>
  `)

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: process.env.EMAIL_ADMIN!,
    subject: `Nuevo pedido #${pedido.numero} — ${pedido.nombre_comprador} (${formatPEN(pedido.total)})`,
    html,
  })
}
