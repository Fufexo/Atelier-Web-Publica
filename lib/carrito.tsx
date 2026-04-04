'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export interface ItemCarrito {
  varianteId: string
  productoId: string
  slug: string
  nombre: string
  imagen: string
  precio: number
  talla: string | null
  color: string | null
  cantidad: number
  stock: number
}

interface CarritoContextType {
  items: ItemCarrito[]
  agregar: (item: Omit<ItemCarrito, 'cantidad'>, cantidad?: number) => void
  quitar: (varianteId: string) => void
  actualizarCantidad: (varianteId: string, cantidad: number) => void
  vaciar: () => void
  total: number
  totalItems: number
}

const CarritoContext = createContext<CarritoContextType | null>(null)

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([])

  useEffect(() => {
    const guardado = localStorage.getItem('carrito')
    if (guardado) setItems(JSON.parse(guardado))
  }, [])

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(items))
  }, [items])

  function agregar(item: Omit<ItemCarrito, 'cantidad'>, cantidad: number = 1) {
    setItems((prev) => {
      const existe = prev.find((i) => i.varianteId === item.varianteId)
      if (existe) {
        return prev.map((i) =>
          i.varianteId === item.varianteId
            ? { ...i, cantidad: Math.min(i.cantidad + cantidad, item.stock) }
            : i
        )
      }
      return [...prev, { ...item, cantidad: Math.min(cantidad, item.stock) }]
    })
  }

  function quitar(varianteId: string) {
    setItems((prev) => prev.filter((i) => i.varianteId !== varianteId))
  }

  function actualizarCantidad(varianteId: string, cantidad: number) {
    if (cantidad <= 0) return quitar(varianteId)
    setItems((prev) =>
      prev.map((i) => i.varianteId === varianteId ? { ...i, cantidad } : i)
    )
  }

  function vaciar() {
    setItems([])
  }

  const total = items.reduce((sum, i) => sum + i.precio * i.cantidad, 0)
  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0)

  return (
    <CarritoContext.Provider value={{ items, agregar, quitar, actualizarCantidad, vaciar, total, totalItems }}>
      {children}
    </CarritoContext.Provider>
  )
}

export function useCarrito() {
  const ctx = useContext(CarritoContext)
  if (!ctx) throw new Error('useCarrito debe usarse dentro de CarritoProvider')
  return ctx
}
