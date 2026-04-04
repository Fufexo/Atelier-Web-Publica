'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ImagenProducto } from '@/lib/types'

export interface VarianteInput {
  talla: string
  color: string
  stock: number
  sku_variante: string
  activa: boolean
}

export interface ProductoInput {
  nombre: string
  slug: string
  descripcion: string
  precio: number
  precio_oferta: number | null
  categoria_id: string | null
  sku: string | null
  orden: number
  imagenes: ImagenProducto[]
  activo: boolean
  destacado: boolean
  genero: 'hombre' | 'mujer' | 'unisex'
  variantes: VarianteInput[]
}

export async function crearProducto(data: ProductoInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: producto, error } = await supabase
    .from('productos')
    .insert({
      nombre: data.nombre,
      slug: data.slug,
      descripcion: data.descripcion || null,
      precio: data.precio,
      precio_oferta: data.precio_oferta,
      categoria_id: data.categoria_id,
      sku: data.sku || null,
      orden: data.orden,
      imagenes: data.imagenes,
      activo: data.activo,
      destacado: data.destacado,
      genero: data.genero,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  if (data.variantes.length > 0) {
    const { error: errVar } = await supabase.from('variantes').insert(
      data.variantes.map((v) => ({ ...v, producto_id: producto.id }))
    )
    if (errVar) return { error: errVar.message }
  }

  revalidatePath('/admin/productos')
  redirect('/admin/productos')
}

export async function actualizarProducto(id: string, data: ProductoInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('productos')
    .update({
      nombre: data.nombre,
      slug: data.slug,
      descripcion: data.descripcion || null,
      precio: data.precio,
      precio_oferta: data.precio_oferta,
      categoria_id: data.categoria_id,
      sku: data.sku || null,
      orden: data.orden,
      imagenes: data.imagenes,
      activo: data.activo,
      destacado: data.destacado,
      genero: data.genero,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  // Re-insertar variantes
  await supabase.from('variantes').delete().eq('producto_id', id)
  if (data.variantes.length > 0) {
    const { error: errVar } = await supabase.from('variantes').insert(
      data.variantes.map((v) => ({ ...v, producto_id: id }))
    )
    if (errVar) return { error: errVar.message }
  }

  revalidatePath('/admin/productos')
  revalidatePath(`/admin/productos/${id}`)
  redirect('/admin/productos')
}

export async function toggleActivo(id: string, activo: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('productos').update({ activo: !activo }).eq('id', id)
  revalidatePath('/admin/productos')
}

function extraerRuta(url: string): string {
  const marker = '/public/productos/'
  const idx = url.indexOf(marker)
  return idx >= 0 ? decodeURIComponent(url.slice(idx + marker.length)) : ''
}

async function eliminarImagenesStorage(supabase: Awaited<ReturnType<typeof createClient>>, imagenes: unknown) {
  if (!Array.isArray(imagenes) || imagenes.length === 0) return
  const rutas = (imagenes as { url: string }[])
    .map((img) => extraerRuta(img.url))
    .filter(Boolean)
  if (rutas.length) await supabase.storage.from('productos').remove(rutas)
}

export async function eliminarProducto(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: prod } = await supabase.from('productos').select('imagenes').eq('id', id).single()
  if (prod) await eliminarImagenesStorage(supabase, prod.imagenes)

  await supabase.from('productos').delete().eq('id', id)
  revalidatePath('/admin/productos')
  redirect('/admin/productos')
}

export async function eliminarProductos(ids: string[]) {
  if (!ids.length) return
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: prods } = await supabase.from('productos').select('imagenes').in('id', ids)
  if (prods) {
    for (const prod of prods) await eliminarImagenesStorage(supabase, prod.imagenes)
  }

  await supabase.from('productos').delete().in('id', ids)
  revalidatePath('/admin/productos')
}
