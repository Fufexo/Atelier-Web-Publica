import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Verifica que haya sesión y que el usuario esté en la tabla `admins`.
 * Tener una cuenta en Supabase Auth no basta: sin esto cualquiera que se registre
 * con la anon key (pública) tendría acceso al panel.
 * Se memoiza por request, así el layout y las páginas no repiten la consulta.
 */
export const requireAdmin = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: esAdmin } = await supabase.rpc('es_admin')
  if (!esAdmin) redirect('/login?error=sin-permiso')

  return { supabase, user }
})
