import { describe, expect, it } from 'vitest'
import { parsearDireccion, parsearImagenes } from './types'

describe('parsearImagenes', () => {
  it('descarta entradas inválidas y ordena', () => {
    expect(
      parsearImagenes([
        { url: 'https://x/b.jpg', alt: 'b', orden: 1 },
        { url: 'https://x/a.jpg', orden: 0 },
        { alt: 'sin url' },
        'texto',
        null,
      ])
    ).toEqual([
      { url: 'https://x/a.jpg', alt: '', orden: 0 },
      { url: 'https://x/b.jpg', alt: 'b', orden: 1 },
    ])
    expect(parsearImagenes(null)).toEqual([])
  })
})

describe('parsearDireccion', () => {
  it('rellena campos faltantes en vez de romper', () => {
    expect(parsearDireccion({ distrito: 'Lince' })).toMatchObject({
      distrito: 'Lince',
      direccion: '',
      referencia: undefined,
    })
    expect(parsearDireccion(null).distrito).toBe('')
  })
})
