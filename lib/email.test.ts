import { describe, expect, it } from 'vitest'
import { escaparHtml, htmlConfirmacion, htmlNotificacionAdmin, type PedidoEmail } from './email'

const pedido: PedidoEmail = {
  id: 'abc-123',
  numero: 42,
  nombre_comprador: '<script>alert(1)</script>',
  email_comprador: 'ana@correo.pe',
  items: [{ nombre_producto: 'Polo "Edición" <b>', talla: 'M', color: null, cantidad: 1, subtotal: 80 }],
  subtotal: 76.27,
  igv: 13.73,
  costo_envio: 10,
  total: 90,
  direccion: {
    nombre_destinatario: 'Ana',
    telefono: '987',
    departamento: 'Lima',
    provincia: 'Lima',
    distrito: 'Miraflores',
    direccion: '<img src=x onerror=alert(1)>',
  },
}

describe('emails de pedido', () => {
  it('escapa todo dato que escribió el cliente', () => {
    const html = htmlConfirmacion(pedido) + htmlNotificacionAdmin(pedido)
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<img src=x')
    expect(html).not.toContain('<b>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('el enlace del admin usa el id del pedido (la ruta es /admin/pedidos/[id])', () => {
    expect(htmlNotificacionAdmin(pedido)).toContain('/admin/pedidos/abc-123')
  })

  it('escaparHtml cubre comillas y ampersand', () => {
    expect(escaparHtml('"a" & \'b\'')).toBe('&quot;a&quot; &amp; &#39;b&#39;')
  })
})
