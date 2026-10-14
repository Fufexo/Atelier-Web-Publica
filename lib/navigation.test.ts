import { describe, expect, it } from 'vitest'
import { estaActivo } from './navigation'

const params = (q: string) => new URLSearchParams(q)

describe('estaActivo', () => {
  it('compara ruta y parámetros', () => {
    expect(estaActivo('/tienda?genero=mujer', '/tienda', params('genero=mujer'))).toBe(true)
    expect(estaActivo('/tienda?genero=mujer', '/tienda', params('genero=hombre'))).toBe(false)
    expect(estaActivo('/nosotros', '/nosotros', params(''))).toBe(true)
  })

  it('/tienda a secas solo cuando no hay otro filtro de colección', () => {
    expect(estaActivo('/tienda', '/tienda', params(''))).toBe(true)
    expect(estaActivo('/tienda', '/tienda', params('q=polo'))).toBe(true)
    expect(estaActivo('/tienda', '/tienda', params('novedad=true'))).toBe(false)
  })
})
