import { describe, expect, it } from 'vitest'
import {
  elegirProveedor,
  escaparHtml,
  htmlConfirmacion,
  htmlNotificacionAdmin,
  type PedidoEmail,
} from './email'

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

describe('elegirProveedor', () => {
  it('prefiere Gmail si está configurado y limpia los espacios de la contraseña', () => {
    expect(
      elegirProveedor({
        GMAIL_USER: 'tienda@gmail.com',
        GMAIL_APP_PASSWORD: 'abcd efgh ijkl mnop',
        RESEND_API_KEY: 're_x',
      })
    ).toEqual({
      tipo: 'gmail',
      usuario: 'tienda@gmail.com',
      clave: 'abcdefghijklmnop',
      from: 'ATELIER <tienda@gmail.com>',
    })
  })

  it('usa Resend si no hay Gmail, y nada si no hay ninguno', () => {
    expect(elegirProveedor({ RESEND_API_KEY: 're_x' })).toMatchObject({
      tipo: 'resend',
      from: 'ATELIER <onboarding@resend.dev>',
    })
    expect(elegirProveedor({ GMAIL_USER: 'solo-usuario@gmail.com' })).toEqual({ tipo: 'ninguno' })
  })

  it('respeta EMAIL_FROM', () => {
    expect(
      elegirProveedor({ RESEND_API_KEY: 're_x', EMAIL_FROM: 'ATELIER <pedidos@atelier.pe>' })
    ).toMatchObject({
      from: 'ATELIER <pedidos@atelier.pe>',
    })
  })
})
