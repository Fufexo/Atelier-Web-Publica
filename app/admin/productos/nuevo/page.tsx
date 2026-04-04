import { createClient } from '@/lib/supabase/server'
import ProductoForm from '@/components/admin/ProductoForm'
import Link from 'next/link'

export const metadata = { title: 'Nuevo producto — Admin' }

export default async function NuevoProductoPage() {
  const supabase = await createClient()
  const { data: categorias } = await supabase
    .from('categorias')
    .select('*')
    .eq('activa', true)
    .order('orden')

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/productos" className="text-gray-400 hover:text-gray-600">
          ← Productos
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo producto</h1>
      </div>

      <ProductoForm categorias={categorias ?? []} />
    </div>
  )
}
