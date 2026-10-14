import { describe, expect, it } from 'vitest'
import {
  agregarItem,
  cambiarCantidad,
  parsearCarrito,
  quitarItem,
  resumenCarrito,
  sincronizarItems,
  type NuevoItem,
} from './items'

const polo: NuevoItem = {
  varianteId: 'v1',
  productoId: 'p1',
  slug: 'polo',
  nombre: 'Polo',
  imagen: '',
  precio: 50,
  talla: 'M',
  color: 'Negro',
  stock: 3,
}

describe('agregarItem', () => {
  it('agrega un producto nuevo', () => {
    expect(agregarItem([], polo, 2)).toEqual([{ ...polo, cantidad: 2 }])
  })

  it('suma unidades sin pasar el stock', () => {
    const items = agregarItem(agregarItem([], polo, 2), polo, 5)
    expect(items).toHaveLength(1)
    expect(items[0].cantidad).toBe(3)
  })
})

describe('cambiarCantidad', () => {
  it('acota al stock y quita con 0', () => {
    const items = agregarItem([], polo)
    expect(cambiarCantidad(items, 'v1', 10)[0].cantidad).toBe(3)
    expect(cambiarCantidad(items, 'v1', 0)).toEqual([])
  })
})

describe('resumenCarrito', () => {
  it('suma total y unidades', () => {
    const items = agregarItem(agregarItem([], polo, 2), { ...polo, varianteId: 'v2', precio: 30 })
    expect(resumenCarrito(items)).toEqual({ total: 130, totalItems: 3 })
    expect(resumenCarrito(quitarItem(items, 'v1'))).toEqual({ total: 30, totalItems: 1 })
  })
})

describe('parsearCarrito', () => {
  it('tolera JSON corrupto o con otra forma', () => {
    expect(parsearCarrito(null)).toEqual([])
    expect(parsearCarrito('{no es json')).toEqual([])
    expect(parsearCarrito('[{"varianteId": 1}]')).toEqual([])
  })

  it('lee un carrito válido', () => {
    const items = [{ ...polo, cantidad: 1 }]
    expect(parsearCarrito(JSON.stringify(items))).toEqual(items)
  })
})

describe('sincronizarItems', () => {
  it('actualiza precio, recorta al stock y quita lo agotado o inexistente', () => {
    const items = [
      { ...polo, cantidad: 3 },
      { ...polo, varianteId: 'v2', cantidad: 1 },
      { ...polo, varianteId: 'v3', cantidad: 1 },
    ]
    const resultado = sincronizarItems(items, [
      { varianteId: 'v1', precio: 45, stock: 2 },
      { varianteId: 'v2', precio: 50, stock: 0 },
    ])
    expect(resultado).toEqual([{ ...polo, precio: 45, stock: 2, cantidad: 2 }])
  })
})
