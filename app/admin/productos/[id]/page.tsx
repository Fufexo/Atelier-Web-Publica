import { notFound } from 'next/navigation'
import ProductoForm from '@/components/admin/ProductoForm'
import { AdminHeader } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/auth'
import { esGenero, parsearImagenes } from '@/lib/types'

export const metadata = { title: 'Editar producto' }

export default async function EditarProductoPage({ params }: PageProps<'/admin/productos/[id]'>) {
  const { id } = await params
  const { supabase } = await requireAdmin()

  const [{ data: producto }, { data: categorias }] = await Promise.all([
    supabase
      .from('productos')
      .select('*, variantes(*)')
      .eq('id', id)
      .order('orden', { referencedTable: 'variantes' })
      .maybeSingle(),
    supabase.from('categorias').select('id, nombre').order('orden'),
  ])
  if (!producto) notFound()

  return (
    <div className="p-8">
      <AdminHeader titulo={producto.nombre} volver={{ href: '/admin/productos', label: 'Productos' }} />
      <ProductoForm
        producto={{
          ...producto,
          imagenes: parsearImagenes(producto.imagenes),
          genero: esGenero(producto.genero) ? producto.genero : 'unisex',
          variantes: producto.variantes.sort((a, b) => a.created_at.localeCompare(b.created_at)),
        }}
        categorias={categorias ?? []}
      />
    </div>
  )
}
