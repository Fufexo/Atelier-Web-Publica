'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { generarSlug } from '@/lib/utils'

async function subirImagenCategoria(supabase: Awaited<ReturnType<typeof createClient>>, file: File, slug: string): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${slug}-${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage
    .from('categorias')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (error) return null

  const { data: { publicUrl } } = supabase.storage.from('categorias').getPublicUrl(path)
  return publicUrl
}

export async function crearCategoria(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const nombre = formData.get('nombre') as string
  const slug = generarSlug(nombre)
  const file = formData.get('imagen') as File | null

  let imagen_url: string | null = null
  if (file && file.size > 0) {
    imagen_url = await subirImagenCategoria(supabase, file, slug)
  }

  await supabase.from('categorias').insert({
    nombre,
    slug,
    descripcion: (formData.get('descripcion') as string) || null,
    imagen_url,
    orden: parseInt(formData.get('orden') as string) || 0,
    activa: true,
  })

  revalidatePath('/admin/categorias')
}

export async function actualizarCategoria(id: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const nombre = formData.get('nombre') as string
  const slug = generarSlug(nombre)
  const file = formData.get('imagen') as File | null

  const updates: Record<string, unknown> = {
    nombre,
    slug,
    descripcion: (formData.get('descripcion') as string) || null,
    orden: parseInt(formData.get('orden') as string) || 0,
  }

  if (file && file.size > 0) {
    const imagen_url = await subirImagenCategoria(supabase, file, slug)
    if (imagen_url) updates.imagen_url = imagen_url
  }

  await supabase.from('categorias').update(updates).eq('id', id)

  revalidatePath('/admin/categorias')
  revalidatePath('/')
}

export async function toggleCategoriaActiva(id: string, activa: boolean): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('categorias').update({ activa: !activa }).eq('id', id)
  revalidatePath('/admin/categorias')
}

export async function eliminarCategoria(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cat } = await supabase.from('categorias').select('imagen_url').eq('id', id).single()

  if (cat?.imagen_url) {
    const ruta = extraerRuta(cat.imagen_url, 'categorias')
    if (ruta) await supabase.storage.from('categorias').remove([ruta])
  }

  await supabase.from('categorias').delete().eq('id', id)
  revalidatePath('/admin/categorias')
}

function extraerRuta(url: string, bucket: string): string {
  const marker = `/public/${bucket}/`
  const idx = url.indexOf(marker)
  return idx >= 0 ? decodeURIComponent(url.slice(idx + marker.length)) : ''
}
