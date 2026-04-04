import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductoForm from '@/components/admin/ProductoForm'
import Link from 'next/link'

export const metadata = { title: 'Editar producto — Admin' }

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: producto }, { data: categorias }] = await Promise.all([
    supabase
      .from('productos')
      .select('*, variantes(*)')
      .eq('id', id)
      .single(),
    supabase
      .from('categorias')
      .select('*')
      .eq('activa', true)
      .order('orden'),
  ])

  if (!producto) notFound()

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/productos" className="text-gray-400 hover:text-gray-600">
          ← Productos
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">{producto.nombre}</h1>
      </div>

      <ProductoForm producto={producto} categorias={categorias ?? []} />
    </div>
  )
}
