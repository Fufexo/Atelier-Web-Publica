import { z } from 'zod'

// Lógica pura del carrito: sin React ni localStorage, para poder testearla.

const itemSchema = z.object({
  varianteId: z.string().min(1),
  productoId: z.string().min(1),
  slug: z.string(),
  nombre: z.string(),
  imagen: z.string(),
  precio: z.number().nonnegative(),
  talla: z.string().nullable(),
  color: z.string().nullable(),
  cantidad: z.number().int().positive(),
  stock: z.number().int().nonnegative(),
})

export type ItemCarrito = z.infer<typeof itemSchema>
export type NuevoItem = Omit<ItemCarrito, 'cantidad'>

/** Lee el carrito guardado. Si el JSON está corrupto o es de otra versión, empieza vacío. */
export function parsearCarrito(raw: string | null): ItemCarrito[] {
  if (!raw) return []
  try {
    const resultado = z.array(itemSchema).safeParse(JSON.parse(raw))
    return resultado.success ? resultado.data : []
  } catch {
    return []
  }
}

/** Agrega unidades sin pasar del stock conocido de la variante. */
export function agregarItem(items: ItemCarrito[], nuevo: NuevoItem, cantidad = 1): ItemCarrito[] {
  const existente = items.find((i) => i.varianteId === nuevo.varianteId)
  if (!existente) {
    return [...items, { ...nuevo, cantidad: Math.min(cantidad, nuevo.stock) }]
  }
  return items.map((i) =>
    i.varianteId === nuevo.varianteId
      ? { ...i, ...nuevo, cantidad: Math.min(i.cantidad + cantidad, nuevo.stock) }
      : i
  )
}

/** Fija la cantidad (acotada al stock). Con 0 o menos quita el producto. */
export function cambiarCantidad(items: ItemCarrito[], varianteId: string, cantidad: number): ItemCarrito[] {
  if (cantidad <= 0) return quitarItem(items, varianteId)
  return items.map((i) => (i.varianteId === varianteId ? { ...i, cantidad: Math.min(cantidad, i.stock) } : i))
}

export function quitarItem(items: ItemCarrito[], varianteId: string): ItemCarrito[] {
  return items.filter((i) => i.varianteId !== varianteId)
}

export function resumenCarrito(items: ItemCarrito[]) {
  return {
    total: items.reduce((sum, i) => sum + i.precio * i.cantidad, 0),
    totalItems: items.reduce((sum, i) => sum + i.cantidad, 0),
  }
}

export interface EstadoVariante {
  varianteId: string
  /** `null` si el producto ya no existe o no está activo. */
  precio: number | null
  stock: number
}

/**
 * Aplica precio y stock actuales (los devuelve la API cuando rechaza un cobro):
 * actualiza precios, recorta cantidades al stock y quita lo que ya no se vende.
 */
export function sincronizarItems(items: ItemCarrito[], estados: EstadoVariante[]): ItemCarrito[] {
  const porId = new Map(estados.map((e) => [e.varianteId, e]))
  return items.flatMap((item) => {
    const estado = porId.get(item.varianteId)
    if (!estado || estado.precio === null || estado.stock <= 0) return []
    return [
      {
        ...item,
        precio: estado.precio,
        stock: estado.stock,
        cantidad: Math.min(item.cantidad, estado.stock),
      },
    ]
  })
}
