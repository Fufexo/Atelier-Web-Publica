import { describe, expect, it } from 'vitest'
import { diaCorto, productosMasVendidos, resumenVentas, ventasPorDia } from './analiticas'

describe('ventasPorDia', () => {
  const desde = '2026-10-12T05:00:00.000Z' // 12 oct, 00:00 en Lima

  it('agrupa por día de Lima e incluye días sin ventas', () => {
    const dias = ventasPorDia(
      [
        { total: 100, created_at: '2026-10-12T15:00:00Z' },
        // 13 oct 03:00 UTC sigue siendo el 12 en Lima
        { total: 50, created_at: '2026-10-13T03:00:00Z' },
        { total: 30, created_at: '2026-10-14T20:00:00Z' },
        // fuera del rango
        { total: 999, created_at: '2026-10-01T12:00:00Z' },
      ],
      desde,
      3
    )
    expect(dias).toEqual([
      { fecha: '2026-10-12', ingresos: 150, pedidos: 2 },
      { fecha: '2026-10-13', ingresos: 0, pedidos: 0 },
      { fecha: '2026-10-14', ingresos: 30, pedidos: 1 },
    ])
    expect(resumenVentas(dias)).toMatchObject({ ingresos: 180, pedidos: 3, ticketPromedio: 60 })
    expect(resumenVentas(dias).mejorDia?.fecha).toBe('2026-10-12')
  })

  it('sin ventas no hay mejor día', () => {
    expect(resumenVentas(ventasPorDia([], desde, 2)).mejorDia).toBeNull()
  })
})

describe('productosMasVendidos', () => {
  it('suma por producto y ordena por unidades', () => {
    const top = productosMasVendidos([
      { nombre_producto: 'Polo', cantidad: 1, precio_unitario: 50 },
      { nombre_producto: 'Jean', cantidad: 3, precio_unitario: 100 },
      { nombre_producto: 'Polo', cantidad: 1, precio_unitario: 40 },
    ])
    expect(top).toEqual([
      { nombre: 'Jean', cantidad: 3, ingresos: 300 },
      { nombre: 'Polo', cantidad: 2, ingresos: 90 },
    ])
  })
})

it('diaCorto', () => {
  expect(diaCorto('2026-10-04')).toBe('4/10')
})
