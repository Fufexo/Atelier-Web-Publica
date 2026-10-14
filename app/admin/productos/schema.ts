import { z } from 'zod'
import { GENEROS } from '@/lib/types'

const opcional = z
  .string()
  .trim()
  .transform((v) => v || null)
  .nullable()

export const varianteSchema = z.object({
  /** Presente si la variante ya existe: se actualiza en vez de recrearse. */
  id: z.uuid().optional(),
  talla: opcional,
  color: opcional,
  stock: z.number().int('El stock debe ser un número entero.').min(0, 'El stock no puede ser negativo.'),
  sku_variante: opcional,
  activa: z.boolean(),
})

export const productoSchema = z
  .object({
    nombre: z.string().trim().min(1, 'El nombre es obligatorio.').max(150),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'El slug solo puede tener minúsculas, números y guiones.'),
    descripcion: opcional,
    precio: z.number().positive('El precio debe ser mayor a 0.'),
    precio_oferta: z.number().positive().nullable(),
    categoria_id: z.uuid().nullable(),
    sku: opcional,
    orden: z.number().int().min(0),
    imagenes: z.array(z.object({ url: z.url(), alt: z.string(), orden: z.number().int() })),
    activo: z.boolean(),
    destacado: z.boolean(),
    genero: z.enum(GENEROS),
    variantes: z.array(varianteSchema),
  })
  .refine((p) => p.precio_oferta === null || p.precio_oferta < p.precio, {
    message: 'El precio de oferta debe ser menor al precio normal.',
    path: ['precio_oferta'],
  })
  .refine(
    (p) => {
      const claves = p.variantes.map((v) => `${v.talla ?? ''}|${v.color ?? ''}`)
      return new Set(claves).size === claves.length
    },
    { message: 'Hay dos variantes con la misma talla y color.', path: ['variantes'] }
  )

export type ProductoInput = z.input<typeof productoSchema>
export type VarianteInput = z.input<typeof varianteSchema>
