import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import TablaProductos from './TablaProductos'

export const metadata = { title: 'Productos — Admin' }

export default async function ProductosPage() {
  const supabase = await createClient()

  const { data: productos } = await supabase
    .from('productos')
    .select('*, categorias(nombre), variantes(stock)')
    .order('created_at', { ascending: false })

  const alertas = (productos ?? []).filter((p) => {
    const stock = (p.variantes as { stock: number }[])?.reduce((s: number, v: { stock: number }) => s + v.stock, 0) ?? 0
    return stock <= 5
  })

  return (
    <div className="p-8">
      {alertas.length > 0 && (
        <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-sm text-amber-700">
            <span className="font-semibold">{alertas.length} {alertas.length === 1 ? 'producto' : 'productos'} con stock bajo o agotado:</span>{' '}
            {alertas.map((p) => p.nombre).join(', ')}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Productos
          {productos?.length ? (
            <span className="ml-2 text-sm font-normal text-gray-400">{productos.length} en total</span>
          ) : null}
        </h1>
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo producto
        </Link>
      </div>

      {!productos?.length ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-16 text-center">
          <p className="text-gray-400 text-sm mb-4">Aún no tienes productos.</p>
          <Link href="/admin/productos/nuevo" className="text-sm font-medium text-slate-700 underline">
            Crear el primero
          </Link>
        </div>
      ) : (
        <TablaProductos productos={productos as Parameters<typeof TablaProductos>[0]['productos']} />
      )}
    </div>
  )
}
