import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Alerta, botonAdmin, inputAdmin, labelAdmin } from '@/components/admin/ui'
import { createClient } from '@/lib/supabase/server'
import { login } from './actions'

export const metadata: Metadata = { title: 'Acceso admin', robots: { index: false } }

const MENSAJES: Record<string, string> = {
  credenciales: 'Email o contraseña incorrectos.',
  'sin-permiso': 'Esta cuenta no tiene acceso al panel.',
}

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const { error } = await searchParams

  // Si ya hay una sesión de admin, ir directo al panel.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user && error !== 'sin-permiso') {
    const { data: esAdmin } = await supabase.rpc('es_admin')
    if (esAdmin) redirect('/admin')
  }

  const mensaje = typeof error === 'string' ? (MENSAJES[error] ?? MENSAJES.credenciales) : null

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Acceso admin</h1>
          <p className="mt-1 text-sm text-gray-500">ATELIER — Panel de gestión</p>
        </div>

        {mensaje && (
          <div className="mb-4">
            <Alerta>{mensaje}</Alerta>
          </div>
        )}

        <form action={login} className="space-y-4">
          <label className="block">
            <span className={labelAdmin}>Email</span>
            <input type="email" name="email" required autoComplete="email" className={inputAdmin} />
          </label>
          <label className="block">
            <span className={labelAdmin}>Contraseña</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className={inputAdmin}
            />
          </label>
          <button type="submit" className={`${botonAdmin} mt-2 w-full justify-center py-2.5`}>
            Ingresar
          </button>
        </form>
      </div>
    </main>
  )
}
