import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Verifica que haya sesión y que el usuario esté en la tabla `admins`.
 * Tener una cuenta en Supabase Auth no basta: sin esto cualquiera que se registre
 * con la anon key (pública) tendría acceso al panel.
 *
 * Una sola consulta: PostgREST valida la firma y la vigencia del token antes de
 * ejecutar `es_admin()`, y `proxy.ts` ya consultó a Supabase Auth en este request
 * (renueva la sesión y detecta las cerradas). Repetir `getUser()` aquí sumaba un
 * viaje de red a cada cambio de sección del panel.
 * Se memoiza por request, así el layout y las páginas no repiten la consulta.
 */
export const requireAdmin = cache(async () => {
  const supabase = await createClient()
  const { data: esAdmin, error } = await supabase.rpc('es_admin')
  if (error) redirect('/login') // sin sesión o token inválido
  if (!esAdmin) redirect('/login?error=sin-permiso')

  return { supabase }
})
