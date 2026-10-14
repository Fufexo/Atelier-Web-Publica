import Image from 'next/image'
import { notFound } from 'next/navigation'
import { AdminHeader, Card } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/auth'
import { actualizarCategoria } from '../actions'
import CategoriaForm from '../CategoriaForm'

export const metadata = { title: 'Editar categoría' }

export default async function EditarCategoriaPage({ params }: PageProps<'/admin/categorias/[id]'>) {
  const { id } = await params
  const { supabase } = await requireAdmin()
  const { data: cat } = await supabase.from('categorias').select('*').eq('id', id).maybeSingle()
  if (!cat) notFound()

  return (
    <div className="mx-auto max-w-2xl p-8">
      <AdminHeader titulo="Editar categoría" volver={{ href: '/admin/categorias', label: 'Categorías' }} />
      <Card className="space-y-5 p-6">
        {cat.imagen_url && (
          <div>
            <Image
              src={cat.imagen_url}
              alt=""
              width={160}
              height={208}
              className="h-52 w-40 rounded-lg border border-gray-200 object-cover"
            />
            <p className="mt-1 text-xs text-gray-500">Imagen actual: sube una nueva para reemplazarla.</p>
          </div>
        )}
        <CategoriaForm
          action={actualizarCategoria.bind(null, id)}
          categoria={cat}
          textoBoton="Guardar cambios"
          conCancelar
        />
      </Card>
    </div>
  )
}
