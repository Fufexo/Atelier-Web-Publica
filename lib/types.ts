import type { Enums, Json, Tables } from './supabase/database.types'

// Los tipos de fila salen de `database.types.ts` (generado desde Supabase). Aquí solo
// se afinan las columnas JSONB y los textos con valores cerrados.

export type EstadoPedido = Enums<'estado_pedido'>
export type EstadoPago = Enums<'estado_pago'>
export type MetodoPago = Enums<'metodo_pago'>

export const GENEROS = ['mujer', 'hombre', 'unisex'] as const
export type Genero = (typeof GENEROS)[number]

export function esGenero(valor: unknown): valor is Genero {
  return typeof valor === 'string' && (GENEROS as readonly string[]).includes(valor)
}

export interface ImagenProducto {
  url: string
  alt: string
  orden: number
}

export type Categoria = Tables<'categorias'>
export type Variante = Tables<'variantes'>
export type ItemPedido = Tables<'items_pedido'>
export type Pago = Tables<'pagos'>

export type Producto = Omit<Tables<'productos'>, 'imagenes' | 'genero'> & {
  imagenes: ImagenProducto[]
  genero: Genero
}

/** Lo mínimo que necesita una card de producto. */
export type ProductoResumen = Pick<
  Producto,
  'id' | 'slug' | 'nombre' | 'precio' | 'precio_oferta' | 'imagenes'
> & {
  categoria: string | null
}

export interface DireccionEnvio {
  nombre_destinatario: string
  telefono: string
  departamento: string
  provincia: string
  distrito: string
  direccion: string
  referencia?: string
}

export type Pedido = Omit<Tables<'pedidos'>, 'direccion_envio'> & {
  direccion_envio: DireccionEnvio
}

/** `imagenes` es JSONB: se valida al leer para no confiar en la forma guardada. */
export function parsearImagenes(valor: Json): ImagenProducto[] {
  if (!Array.isArray(valor)) return []
  return valor
    .filter(
      (img): img is { url: string; alt?: string; orden?: number } =>
        typeof img === 'object' && img !== null && !Array.isArray(img) && typeof img.url === 'string'
    )
    .map((img, i) => ({
      url: img.url,
      alt: typeof img.alt === 'string' ? img.alt : '',
      orden: typeof img.orden === 'number' ? img.orden : i,
    }))
    .sort((a, b) => a.orden - b.orden)
}

export function parsearDireccion(valor: Json): DireccionEnvio {
  const d = (typeof valor === 'object' && valor !== null && !Array.isArray(valor) ? valor : {}) as Record<
    string,
    Json | undefined
  >
  const texto = (k: string) => (typeof d[k] === 'string' ? (d[k] as string) : '')
  return {
    nombre_destinatario: texto('nombre_destinatario'),
    telefono: texto('telefono'),
    departamento: texto('departamento'),
    provincia: texto('provincia'),
    distrito: texto('distrito'),
    direccion: texto('direccion'),
    referencia: texto('referencia') || undefined,
  }
}
