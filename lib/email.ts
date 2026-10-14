import 'server-only'
import { Resend } from 'resend'
import { formatearPrecio, numeroPedido } from '@/lib/format'
import type { DireccionEnvio } from '@/lib/types'

export interface ItemEmail {
  nombre_producto: string
  talla: string | null
  color: string | null
  cantidad: number
  subtotal: number
}

export interface PedidoEmail {
  id: string
  numero: number
  nombre_comprador: string
  email_comprador: string
  items: ItemEmail[]
  subtotal: number
  igv: number
  costo_envio: number
  total: number
  direccion: DireccionEnvio
}

const ENTIDADES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Escapa texto del usuario antes de meterlo en el HTML de un email. */
export function escaparHtml(texto: string): string {
  return texto.replace(/[&<>"']/g, (c) => ENTIDADES[c])
}

const e = escaparHtml

// ── Plantillas ──────────────────────────────────────────────────────────────

const TH =
  'font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a8a29e;padding-bottom:12px;border-bottom:1px solid #e7e3de;font-weight:normal;'
const TD = 'padding:12px 0;border-bottom:1px solid #e7e3de;font-size:14px;'

function tablaItems(items: ItemEmail[]) {
  const filas = items
    .map((item) => {
      const variante = [item.talla, item.color].filter(Boolean).join(' · ')
      return `
      <tr>
        <td style="${TD}color:#1c1917;">
          ${e(item.nombre_producto)}
          ${variante ? `<br><span style="font-size:12px;color:#a8a29e;">${e(variante)}</span>` : ''}
        </td>
        <td style="${TD}text-align:center;color:#57534e;">×${item.cantidad}</td>
        <td style="${TD}text-align:right;color:#1c1917;">${formatearPrecio(item.subtotal)}</td>
      </tr>`
    })
    .join('')

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <thead>
        <tr>
          <th style="${TH}text-align:left;">Producto</th>
          <th style="${TH}text-align:center;">Cant.</th>
          <th style="${TH}text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>`
}

function filaTotal(etiqueta: string, valor: string, destacada = false) {
  const estilo = destacada
    ? 'font-size:16px;color:#1c1917;font-weight:bold;padding-top:12px;border-top:1px solid #e7e3de;'
    : 'font-size:13px;color:#78716c;padding:4px 0;'
  return `<tr><td style="${estilo}">${etiqueta}</td><td style="${estilo}text-align:right;">${valor}</td></tr>`
}

function layout(contenido: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f2ed;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2ed;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;">
        <tr>
          <td style="background:#1c1917;padding:32px 40px;text-align:center;">
            <p style="margin:0;color:#ffffff;font-size:22px;letter-spacing:6px;text-transform:uppercase;">ATELIER</p>
          </td>
        </tr>
        <tr><td style="padding:40px;">${contenido}</td></tr>
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

export function htmlConfirmacion(pedido: PedidoEmail): string {
  const dir = pedido.direccion
  const direccion = [dir.direccion, dir.referencia, `${dir.distrito}, ${dir.provincia}`, dir.departamento]
    .filter(Boolean)
    .map((linea) => e(linea!))
    .join('<br>')

  return layout(`
    <h1 style="margin:0 0 8px;font-size:24px;color:#1c1917;font-weight:normal;">Gracias por tu pedido</h1>
    <p style="margin:0 0 32px;font-size:14px;color:#a8a29e;letter-spacing:1px;">Pedido ${numeroPedido(pedido.numero)}</p>

    <p style="margin:0 0 24px;font-size:15px;color:#44403c;line-height:1.6;">
      Hola ${e(pedido.nombre_comprador)}, recibimos tu pedido y está siendo procesado.
      Te avisaremos cuando sea enviado.
    </p>

    ${tablaItems(pedido.items)}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      ${filaTotal('Subtotal (sin IGV)', formatearPrecio(pedido.subtotal))}
      ${filaTotal('IGV (18%)', formatearPrecio(pedido.igv))}
      ${filaTotal('Envío', formatearPrecio(pedido.costo_envio))}
      ${filaTotal('Total', formatearPrecio(pedido.total), true)}
    </table>

    <div style="background:#f5f2ed;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a8a29e;">Dirección de envío</p>
      <p style="margin:0;font-size:14px;color:#44403c;line-height:1.7;">${direccion}</p>
    </div>

    <p style="margin:0;font-size:13px;color:#a8a29e;line-height:1.6;">
      ¿Tienes alguna consulta? Responde este correo o escríbenos por nuestros canales de atención.
    </p>
  `)
}

export function htmlNotificacionAdmin(pedido: PedidoEmail): string {
  const urlAdmin = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/admin/pedidos/${pedido.id}`
  return layout(`
    <h1 style="margin:0 0 8px;font-size:22px;color:#1c1917;font-weight:normal;">Nuevo pedido recibido</h1>
    <p style="margin:0 0 32px;font-size:14px;color:#a8a29e;letter-spacing:1px;">Pedido ${numeroPedido(pedido.numero)}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="font-size:13px;color:#78716c;padding:6px 0;width:120px;">Cliente</td><td style="font-size:13px;color:#1c1917;">${e(pedido.nombre_comprador)}</td></tr>
      <tr><td style="font-size:13px;color:#78716c;padding:6px 0;">Email</td><td style="font-size:13px;color:#1c1917;">${e(pedido.email_comprador)}</td></tr>
      <tr><td style="font-size:13px;color:#78716c;padding:6px 0;">Destino</td><td style="font-size:13px;color:#1c1917;">${e(pedido.direccion.distrito)}, ${e(pedido.direccion.departamento)}</td></tr>
      <tr><td style="font-size:13px;color:#78716c;padding:6px 0;">Total</td><td style="font-size:16px;color:#1c1917;font-weight:bold;">${formatearPrecio(pedido.total)}</td></tr>
    </table>

    ${tablaItems(pedido.items)}

    <a href="${e(urlAdmin)}"
       style="display:inline-block;background:#1c1917;color:#ffffff;padding:12px 28px;font-size:12px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;">
      Ver pedido en admin
    </a>
  `)
}

// ── Envío ───────────────────────────────────────────────────────────────────

export interface Mensaje {
  to: string
  subject: string
  html: string
}

export type Proveedor =
  | { tipo: 'gmail'; usuario: string; clave: string; from: string }
  | { tipo: 'resend'; apiKey: string; from: string }
  | { tipo: 'ninguno' }

/**
 * Elige cómo enviar según las variables de entorno:
 * - Gmail (GMAIL_USER + GMAIL_APP_PASSWORD): gratis y entrega a cualquier destinatario.
 * - Resend (RESEND_API_KEY): con `onboarding@resend.dev` solo entrega al dueño de la
 *   cuenta; para clientes hay que verificar un dominio y configurar EMAIL_FROM.
 */
export function elegirProveedor(env: Record<string, string | undefined>): Proveedor {
  if (env.GMAIL_USER && env.GMAIL_APP_PASSWORD) {
    return {
      tipo: 'gmail',
      usuario: env.GMAIL_USER,
      // Google muestra la contraseña de aplicación en grupos con espacios.
      clave: env.GMAIL_APP_PASSWORD.replace(/\s/g, ''),
      from: env.EMAIL_FROM ?? `ATELIER <${env.GMAIL_USER}>`,
    }
  }
  if (env.RESEND_API_KEY) {
    return {
      tipo: 'resend',
      apiKey: env.RESEND_API_KEY,
      from: env.EMAIL_FROM ?? 'ATELIER <onboarding@resend.dev>',
    }
  }
  return { tipo: 'ninguno' }
}

/**
 * Crea la función de envío. Los clientes se instancian aquí y no a nivel de
 * módulo: sin las variables de entorno el build de Vercel fallaría.
 */
async function crearEnviador(proveedor: Proveedor): Promise<((m: Mensaje) => Promise<void>) | null> {
  if (proveedor.tipo === 'gmail') {
    const { createTransport } = await import('nodemailer')
    const transporte = createTransport({
      service: 'gmail',
      auth: { user: proveedor.usuario, pass: proveedor.clave },
    })
    return async (m) => {
      await transporte.sendMail({ from: proveedor.from, replyTo: proveedor.usuario, ...m })
    }
  }
  if (proveedor.tipo === 'resend') {
    const resend = new Resend(proveedor.apiKey)
    return async (m) => {
      const { error } = await resend.emails.send({ from: proveedor.from, ...m })
      if (error) throw new Error(`Resend: ${error.message}`)
    }
  }
  return null
}

/**
 * Envía la confirmación al cliente y el aviso al admin. Nunca lanza: un email
 * fallido no debe convertir una venta cobrada en un error para el cliente.
 */
export async function enviarEmailsPedido(pedido: PedidoEmail): Promise<void> {
  const enviar = await crearEnviador(elegirProveedor(process.env))
  if (!enviar) {
    console.warn('[email] Sin proveedor configurado (GMAIL_* o RESEND_API_KEY): no se envían emails')
    return
  }

  const mensajes: Mensaje[] = [
    {
      to: pedido.email_comprador,
      subject: `ATELIER — Confirmación de pedido ${numeroPedido(pedido.numero)}`,
      html: htmlConfirmacion(pedido),
    },
  ]
  if (process.env.EMAIL_ADMIN) {
    mensajes.push({
      to: process.env.EMAIL_ADMIN,
      subject: `Nuevo pedido ${numeroPedido(pedido.numero)} — ${pedido.nombre_comprador} (${formatearPrecio(pedido.total)})`,
      html: htmlNotificacionAdmin(pedido),
    })
  }

  const resultados = await Promise.allSettled(mensajes.map(enviar))
  resultados.forEach((r, i) => {
    if (r.status === 'rejected') console.error(`[email] No se pudo enviar a ${mensajes[i].to}`, r.reason)
  })
}
