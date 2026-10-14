'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { generarSlug } from '@/lib/format'
import type { SupabaseServerClient } from '@/lib/supabase/server'

const BUCKET = 'categorias'
const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

export interface EstadoFormulario {
  error?: string
  ok?: boolean
}

const categoriaSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.').max(80),
  descripcion: z
    .string()
    .trim()
    .max(300)
    .transform((v) => v || null),
  orden: z.coerce.number().int().min(0).catch(0),
})

function leerFormulario(formData: FormData) {
  return categoriaSchema.safeParse({
    nombre: formData.get('nombre') ?? '',
    descripcion: formData.get('descripcion') ?? '',
    orden: formData.get('orden') ?? 0,
  })
}

function revalidarCategorias() {
  revalidatePath('/admin/categorias')
  revalidatePath('/tienda')
}

/** Sube la portada si se eligió un archivo. Sin archivo devuelve `{}`. */
async function subirImagen(
  supabase: SupabaseServerClient,
  formData: FormData,
  slug: string
): Promise<{ url?: string; error?: string }> {
  const file = formData.get('imagen')
  if (!(file instanceof File) || file.size === 0) return {}
  if (!TIPOS_IMAGEN.includes(file.type)) return { error: 'La imagen debe ser JPG, PNG, WEBP o AVIF.' }
  if (file.size > 5 * 1024 * 1024) return { error: 'La imagen no puede pesar más de 5 MB.' }

  const path = `${slug}-${Date.now()}.${file.type.split('/')[1]}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type })
  if (error) return { error: `No se pudo subir la imagen: ${error.message}` }
  return { url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl }
}

function mensajeError(error: { code?: string; message: string }) {
  return error.code === '23505' ? 'Ya existe una categoría con ese nombre.' : error.message
}

export async function crearCategoria(_prev: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const { supabase } = await requireAdmin()
  const parsed = leerFormulario(formData)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const slug = generarSlug(parsed.data.nombre)
  const imagen = await subirImagen(supabase, formData, slug)
  if (imagen.error) return { error: imagen.error }

  const { error } = await supabase
    .from('categorias')
    .insert({ ...parsed.data, slug, imagen_url: imagen.url ?? null, activa: true })
  if (error) return { error: mensajeError(error) }

  revalidarCategorias()
  return { ok: true }
}

export async function actualizarCategoria(
  id: string,
  _prev: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const { supabase } = await requireAdmin()
  const parsed = leerFormulario(formData)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const slug = generarSlug(parsed.data.nombre)
  const imagen = await subirImagen(supabase, formData, slug)
  if (imagen.error) return { error: imagen.error }

  const { error } = await supabase
    .from('categorias')
    .update({ ...parsed.data, slug, ...(imagen.url ? { imagen_url: imagen.url } : {}) })
    .eq('id', id)
  if (error) return { error: mensajeError(error) }

  revalidarCategorias()
  redirect('/admin/categorias')
}

export async function toggleCategoriaActiva(id: string, activa: boolean): Promise<void> {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('categorias').update({ activa: !activa }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidarCategorias()
}

export async function eliminarCategoria(id: string): Promise<void> {
  const { supabase } = await requireAdmin()
  const { data: cat } = await supabase.from('categorias').select('imagen_url').eq('id', id).maybeSingle()

  const { error } = await supabase.from('categorias').delete().eq('id', id)
  if (error) throw new Error(error.message)

  // La imagen se borra después: si falla el borrado de la categoría, no queda rota.
  const marca = `/public/${BUCKET}/`
  const url = cat?.imagen_url
  const i = url?.indexOf(marca) ?? -1
  if (url && i >= 0) {
    await supabase.storage.from(BUCKET).remove([decodeURIComponent(url.slice(i + marca.length))])
  }
  revalidarCategorias()
}
