import { z } from 'zod'
import { DESTINO_PROVINCIA, costoEnvio } from '@/lib/envios'

// Mensajes genéricos de Zod en español (los de cada campo se escriben a mano abajo).
z.config(z.locales.es())

// Contrato del checkout. El formulario usa `formularioCheckoutSchema` para mostrar
// errores junto a cada campo; POST /api/culqi/cobrar valida `solicitudCobroSchema`,
// que agrega el token y los ítems. El cliente solo dice QUÉ compra y A DÓNDE va:
// precios, envío y totales los calcula el servidor.

const obligatorio = 'Este campo es obligatorio.'
const texto = (max: number) => z.string().trim().min(1, obligatorio).max(max)

export const clienteSchema = z.object({
  nombre: texto(120),
  email: z.email('Ingresa un correo válido.').max(200),
  telefono: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{6,20}$/, 'Ingresa un teléfono válido.'),
})

export const envioSchema = z
  .object({
    /** Distrito de Lima o `DESTINO_PROVINCIA`. */
    destino: z.string().refine((d) => costoEnvio(d) !== null, 'Selecciona tu distrito.'),
    ciudad: z.string().trim().max(80).optional(),
    departamento: z.string().trim().max(80).optional(),
    direccion: texto(200),
    referencia: z.string().trim().max(200).optional(),
  })
  .superRefine((envio, ctx) => {
    if (envio.destino !== DESTINO_PROVINCIA) return
    if (!envio.ciudad) ctx.addIssue({ code: 'custom', path: ['ciudad'], message: obligatorio })
    if (!envio.departamento) ctx.addIssue({ code: 'custom', path: ['departamento'], message: obligatorio })
  })

export const formularioCheckoutSchema = z.object({
  cliente: clienteSchema,
  envio: envioSchema,
})

export const solicitudCobroSchema = formularioCheckoutSchema.extend({
  token: z.string().trim().min(1).max(200),
  items: z
    .array(
      z.object({
        varianteId: z.uuid(),
        cantidad: z.number().int().min(1).max(20),
      })
    )
    .min(1, 'El carrito está vacío.')
    .max(30),
  /** Total que vio el cliente. Si no coincide con el real, no se cobra. */
  totalEsperado: z.number().nonnegative(),
})

export type FormularioCheckout = z.infer<typeof formularioCheckoutSchema>
export type SolicitudCobro = z.infer<typeof solicitudCobroSchema>

/** Convierte los errores de Zod en `{ 'cliente.email': 'mensaje' }` (el primero por campo). */
export function erroresPorCampo(error: z.ZodError): Record<string, string> {
  const errores: Record<string, string> = {}
  for (const issue of error.issues) {
    const campo = issue.path.join('.')
    errores[campo] ??= issue.message
  }
  return errores
}
