import { describe, expect, it } from 'vitest'
import { DESTINO_PROVINCIA } from '@/lib/envios'
import { armarPedido, type VarianteEnBase } from './armar-pedido'
import { solicitudCobroSchema, type SolicitudCobro } from './schema'

const V1 = '11111111-1111-4111-8111-111111111111'
const V2 = '22222222-2222-4222-8222-222222222222'

const variantes: VarianteEnBase[] = [
  {
    id: V1,
    talla: 'M',
    color: 'Negro',
    stock: 5,
    activa: true,
    productos: { id: 'p1', nombre: 'Polo', precio: 100, precio_oferta: 80, activo: true },
  },
  {
    id: V2,
    talla: '32',
    color: null,
    stock: 1,
    activa: true,
    productos: { id: 'p2', nombre: 'Jean', precio: 150, precio_oferta: null, activo: true },
  },
]

function solicitud(cambios: Partial<SolicitudCobro> = {}): SolicitudCobro {
  return {
    token: 'tok_test',
    cliente: { nombre: 'Ana Pérez', email: 'ana@correo.pe', telefono: '987654321' },
    envio: { destino: 'Miraflores', direccion: 'Av. Larco 345' },
    items: [
      { varianteId: V1, cantidad: 2 },
      { varianteId: V2, cantidad: 1 },
    ],
    // 2 × 80 (oferta) + 150 + 10 de envío
    totalEsperado: 320,
    ...cambios,
  }
}

describe('armarPedido', () => {
  it('calcula precios con la base, no con lo que manda el cliente', () => {
    const r = armarPedido(solicitud(), variantes)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.lineas.map((l) => l.precioUnitario)).toEqual([80, 150])
    expect(r.totales).toEqual({ subtotal: 262.71, igv: 47.29, envio: 10, total: 320 })
    expect(r.direccion).toMatchObject({ distrito: 'Miraflores', provincia: 'Lima', departamento: 'Lima' })
  })

  it('rechaza si el total que vio el cliente no coincide (precio manipulado o cambiado)', () => {
    expect(armarPedido(solicitud({ totalEsperado: 1 }), variantes)).toMatchObject({ ok: false, status: 409 })
  })

  it('rechaza si falta stock', () => {
    const r = armarPedido(
      solicitud({ items: [{ varianteId: V2, cantidad: 2 }], totalEsperado: 310 }),
      variantes
    )
    expect(r).toMatchObject({ ok: false, status: 409 })
    if (!r.ok) expect(r.error).toContain('Solo quedan 1')
  })

  it('rechaza variantes inexistentes o de productos inactivos', () => {
    const inactivo = variantes.map((v) => ({
      ...v,
      productos: v.productos && { ...v.productos, activo: false },
    }))
    expect(armarPedido(solicitud(), inactivo)).toMatchObject({ ok: false, status: 409 })
    expect(armarPedido(solicitud(), [variantes[0]])).toMatchObject({ ok: false, status: 409 })
  })

  it('usa ciudad y departamento para provincia, con su tarifa', () => {
    const r = armarPedido(
      solicitud({
        envio: {
          destino: DESTINO_PROVINCIA,
          ciudad: 'Arequipa',
          departamento: 'Arequipa',
          direccion: 'Calle Mercaderes 1',
        },
        totalEsperado: 335,
      }),
      variantes
    )
    expect(r.ok && r.direccion).toMatchObject({
      distrito: 'Arequipa',
      provincia: 'Arequipa',
      departamento: 'Arequipa',
    })
    expect(r.ok && r.totales.envio).toBe(25)
  })
})

describe('solicitudCobroSchema', () => {
  it('acepta una solicitud válida', () => {
    expect(solicitudCobroSchema.safeParse(solicitud()).success).toBe(true)
  })

  it('exige ciudad y departamento si el envío es a provincia', () => {
    const r = solicitudCobroSchema.safeParse(
      solicitud({ envio: { destino: DESTINO_PROVINCIA, direccion: 'X' } })
    )
    expect(r.success).toBe(false)
    expect(r.error?.issues.map((i) => i.path.join('.'))).toEqual(['envio.ciudad', 'envio.departamento'])
  })

  it('rechaza distritos inventados, cantidades absurdas y email inválido', () => {
    const invalidas = [
      solicitud({ envio: { destino: 'Narnia', direccion: 'X' } }),
      solicitud({ items: [{ varianteId: V1, cantidad: 999 }] }),
      solicitud({ cliente: { nombre: 'A', email: 'no-es-email', telefono: '987654321' } }),
    ]
    for (const s of invalidas) expect(solicitudCobroSchema.safeParse(s).success).toBe(false)
  })
})
