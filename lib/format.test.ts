import { describe, expect, it } from 'vitest'
import { diaEnLima, generarSlug, inicioDelDiaEnLima, numeroPedido } from './format'

describe('generarSlug', () => {
  it('quita tildes, símbolos y espacios repetidos', () => {
    expect(generarSlug('  Polo Básico  Algodón Pima! ')).toBe('polo-basico-algodon-pima')
    expect(generarSlug('Jean -- 501')).toBe('jean-501')
    expect(generarSlug('Ñandú & Cía')).toBe('nandu-cia')
  })
})

describe('fechas en Lima (UTC-5)', () => {
  // 14 oct 2026, 02:00 UTC = 13 oct 2026, 21:00 en Lima
  const nocheEnLima = new Date('2026-10-14T02:00:00Z')

  it('el día se calcula en Lima, no en UTC', () => {
    expect(diaEnLima(nocheEnLima)).toBe('2026-10-13')
  })

  it('el inicio del día de Lima es las 05:00 UTC', () => {
    expect(inicioDelDiaEnLima(0, nocheEnLima)).toBe('2026-10-13T05:00:00.000Z')
    expect(inicioDelDiaEnLima(29, nocheEnLima)).toBe('2026-09-14T05:00:00.000Z')
  })
})

describe('numeroPedido', () => {
  it('rellena con ceros', () => {
    expect(numeroPedido(7)).toBe('#0007')
    expect(numeroPedido(12345)).toBe('#12345')
  })
})
