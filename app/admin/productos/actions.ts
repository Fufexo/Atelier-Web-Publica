'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import type { SupabaseServerClient } from '@/lib/supabase/server'
import { productoSchema, type ProductoInput } from './schema'

export type ResultadoAccion = { error: string } | undefined

const BUCKET = 'productos'

/** Revalida el panel y las páginas públicas que muestran productos. */
function revalidarProductos(slug?: string) {
  revalidatePath('/admin/productos')
  revalidatePath('/')
  revalidatePath('/tienda')
  if (slug) revalidatePath(`/producto/${slug}`)
}

function mensajeError(error: { code?: string; message: string }): string {
  if (error.code === '23505') return 'Ya existe un producto con ese slug o SKU.'
  return `No se pudo guardar: ${error.message}`
}

export async function guardarProducto(id: string | null, input: ProductoInput): Promise<ResultadoAccion> {
  const { supabase } = await requireAdmin()

  const parsed = productoSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const { variantes, ...producto } = parsed.data

  let productoId = id
  if (id) {
    const { error } = await supabase.from('productos').update(producto).eq('id', id)
    if (error) return { error: mensajeError(error) }
  } else {
    const { data, error } = await supabase.from('productos').insert(producto).select('id').single()
    if (error) return { error: mensajeError(error) }
    productoId = data.id
  }

  const errorVariantes = await sincronizarVariantes(supabase, productoId!, variantes)
  if (errorVariantes) return { error: errorVariantes }

  revalidarProductos(producto.slug)
  redirect('/admin/productos')
}

/**
 * Actualiza las variantes existentes, crea las nuevas y borra las quitadas.
 * Mantener los IDs evita romper carritos abiertos y el vínculo de pedidos anteriores.
 * Cada variante guarda su posición en el editor: de ella depende qué foto toca a cada color.
 */
async function sincronizarVariantes(
  supabase: SupabaseServerClient,
  productoId: string,
  enEditor: ReturnType<typeof productoSchema.parse>['variantes']
): Promise<string | null> {
  const variantes = enEditor.map((v, orden) => ({ ...v, orden }))
  const { data: actuales, error } = await supabase
    .from('variantes')
    .select('id')
    .eq('producto_id', productoId)
  if (error) return mensajeError(error)

  const conservar = new Set(variantes.flatMap((v) => (v.id ? [v.id] : [])))
  const borrar = actuales.map((v) => v.id).filter((vid) => !conservar.has(vid))
  if (borrar.length) {
    const { error: e } = await supabase.from('variantes').delete().in('id', borrar)
    if (e) return mensajeError(e)
  }

  const existentes = variantes.filter((v) => v.id)
  if (existentes.length) {
    const { error: e } = await supabase
      .from('variantes')
      .upsert(existentes.map((v) => ({ ...v, id: v.id!, producto_id: productoId })))
    if (e) return mensajeError(e)
  }

  const nuevas = variantes.filter((v) => !v.id)
  if (nuevas.length) {
    const { error: e } = await supabase
      .from('variantes')
      .insert(nuevas.map((v) => ({ ...v, producto_id: productoId })))
    if (e) return mensajeError(e)
  }
  return null
}

export async function toggleActivo(id: string, activo: boolean): Promise<void> {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('productos').update({ activo: !activo }).eq('id', id)
  if (error) throw new Error(mensajeError(error))
  revalidarProductos()
}

function rutaEnBucket(url: string): string | null {
  const marca = `/public/${BUCKET}/`
  const i = url.indexOf(marca)
  return i >= 0 ? decodeURIComponent(url.slice(i + marca.length)) : null
}

export async function eliminarProductos(ids: string[]): Promise<void> {
  if (!ids.length) return
  const { supabase } = await requireAdmin()

  const { data: prods } = await supabase.from('productos').select('imagenes').in('id', ids)
  const { error } = await supabase.from('productos').delete().in('id', ids)
  if (error) throw new Error(mensajeError(error))

  // Las imágenes se borran después: si falla el borrado del producto, no quedan rotas.
  const rutas = (prods ?? [])
    .flatMap((p) => (Array.isArray(p.imagenes) ? p.imagenes : []))
    .flatMap((img) =>
      img && typeof img === 'object' && 'url' in img && typeof img.url === 'string' ? [img.url] : []
    )
    .flatMap((url) => rutaEnBucket(url) ?? [])
  if (rutas.length) await supabase.storage.from(BUCKET).remove(rutas)

  revalidarProductos()
}

export async function eliminarProducto(id: string): Promise<void> {
  await eliminarProductos([id])
}
