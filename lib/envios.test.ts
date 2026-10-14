import { describe, expect, it } from 'vitest'
import { COSTO_ENVIO_PROVINCIA, DESTINO_PROVINCIA, DISTRITOS_LIMA, costoEnvio } from './envios'

describe('costoEnvio', () => {
  it('devuelve la tarifa del distrito', () => {
    expect(costoEnvio('Miraflores')).toBe(10)
    expect(costoEnvio('Ventanilla')).toBe(25)
  })

  it('provincia tiene tarifa fija', () => {
    expect(costoEnvio(DESTINO_PROVINCIA)).toBe(COSTO_ENVIO_PROVINCIA)
  })

  it('un destino desconocido no tiene tarifa', () => {
    expect(costoEnvio('Narnia')).toBeNull()
    expect(costoEnvio('')).toBeNull()
  })

  it('no hay distritos repetidos', () => {
    const nombres = DISTRITOS_LIMA.map((d) => d.nombre)
    expect(new Set(nombres).size).toBe(nombres.length)
  })
})
