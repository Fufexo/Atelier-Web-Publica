import { login } from './actions'

export const metadata = { title: 'Acceso Admin' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const hayError = !!params.error

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Acceso Admin</h1>
            <p className="text-sm text-gray-500 mt-1">Tienda de Ropa — Panel de gestión</p>
          </div>

          {hayError && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              Email o contraseña incorrectos.
            </div>
          )}

          <form action={login} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-800 transition-colors mt-2"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
