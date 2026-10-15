import Image from 'next/image'
import Link from 'next/link'
import BotonEnviar from '@/components/admin/BotonEnviar'
import ConfirmDeleteButton from '@/components/admin/ConfirmDeleteButton'
import { AdminHeader, Card, CardHeader } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/auth'
import { crearCategoria, eliminarCategoria, toggleCategoriaActiva } from './actions'
import CategoriaForm from './CategoriaForm'

export const metadata = { title: 'Categorías' }

export default async function CategoriasPage() {
  const { supabase } = await requireAdmin()
  const { data: categorias, error } = await supabase
    .from('categorias')
    .select('*, productos(count)')
    .order('orden')
  if (error) throw new Error(error.message)

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <AdminHeader titulo="Categorías" />

      <Card className="overflow-hidden">
        <CardHeader titulo="Categorías existentes">
          <span className="text-xs text-gray-500">{categorias.length} total</span>
        </CardHeader>

        {categorias.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-gray-500">Sin categorías aún.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {categorias.map((cat) => (
              <li key={cat.id} className="flex items-center gap-4 px-6 py-3">
                <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {cat.imagen_url && (
                    <Image src={cat.imagen_url} alt="" fill sizes="40px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{cat.nombre}</p>
                  <p className="truncate text-xs text-gray-500">
                    /{cat.slug} · orden {cat.orden} · {cat.productos[0]?.count ?? 0} productos
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <form action={toggleCategoriaActiva.bind(null, cat.id, cat.activa)}>
                    <BotonEnviar
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        cat.activa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {cat.activa ? 'Activa' : 'Inactiva'}
                    </BotonEnviar>
                  </form>
                  <Link
                    href={`/admin/categorias/${cat.id}`}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    Editar
                  </Link>
                  <ConfirmDeleteButton
                    action={eliminarCategoria.bind(null, cat.id)}
                    mensaje={`¿Eliminar la categoría "${cat.nombre}"? Sus productos quedarán sin categoría.`}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Eliminar
                  </ConfirmDeleteButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-gray-900">Nueva categoría</h2>
        <CategoriaForm action={crearCategoria} textoBoton="Crear categoría" />
      </Card>
    </div>
  )
}
