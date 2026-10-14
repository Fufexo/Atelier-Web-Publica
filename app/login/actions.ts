'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const email = formData.get('email')
  const password = formData.get('password')
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    redirect('/login?error=credenciales')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect('/login?error=credenciales')

  // Una cuenta válida no basta: tiene que estar en la tabla `admins`.
  const { data: esAdmin } = await supabase.rpc('es_admin')
  if (!esAdmin) {
    await supabase.auth.signOut()
    redirect('/login?error=sin-permiso')
  }

  redirect('/admin')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
