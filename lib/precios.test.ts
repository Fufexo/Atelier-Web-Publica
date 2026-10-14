import { describe, expect, it } from 'vitest'
import { aCentimos, calcularTotales, precioFinal, redondear } from './precios'

describe('calcularTotales', () => {
  it('desglosa el IGV incluido en el precio y suma el envío aparte', () => {
    expect(calcularTotales(118, 10)).toEqual({ subtotal: 100, igv: 18, envio: 10, total: 128 })
  })

  it('redondea a céntimos y subtotal + IGV siempre suma el total de productos', () => {
    const t = calcularTotales(99.9)
    expect(t.subtotal).toBe(84.66)
    expect(t.igv).toBe(15.24)
    expect(redondear(t.subtotal + t.igv)).toBe(99.9)
  })

  it('sin envío el total es el de productos', () => {
    expect(calcularTotales(50).total).toBe(50)
  })
})

describe('precioFinal', () => {
  it('usa la oferta si existe', () => {
    expect(precioFinal({ precio: 100, precio_oferta: 80 })).toBe(80)
    expect(precioFinal({ precio: 100, precio_oferta: null })).toBe(100)
  })
})

describe('aCentimos', () => {
  it('evita errores de coma flotante', () => {
    expect(aCentimos(19.99)).toBe(1999)
    expect(aCentimos(0.1 + 0.2)).toBe(30)
  })
})
