import ProductoForm from '@/components/admin/ProductoForm'
import { AdminHeader } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/auth'

export const metadata = { title: 'Nuevo producto' }

export default async function NuevoProductoPage() {
  const { supabase } = await requireAdmin()
  const { data: categorias } = await supabase.from('categorias').select('id, nombre').order('orden')

  return (
    <div className="p-8">
      <AdminHeader titulo="Nuevo producto" volver={{ href: '/admin/productos', label: 'Productos' }} />
      <ProductoForm categorias={categorias ?? []} />
    </div>
  )
}
