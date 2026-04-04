import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { crearCategoria, toggleCategoriaActiva, eliminarCategoria } from './actions'
import ConfirmDeleteButton from '@/components/admin/ConfirmDeleteButton'

export const metadata = { title: 'Categorías — Admin' }

export default async function CategoriasPage() {
  const supabase = await createClient()
  const { data: categorias } = await supabase
    .from('categorias')
    .select('*, productos(count)')
    .order('orden')

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>

      {/* ── Lista ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Categorías existentes</h2>
          <span className="text-xs text-gray-400">{categorias?.length ?? 0} total</span>
        </div>

        {!categorias?.length ? (
          <p className="px-6 py-10 text-sm text-gray-400 text-center">Sin categorías aún.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {categorias.map((cat) => (
              <div key={cat.id} className="flex items-center gap-4 px-6 py-3">
                {/* Thumbnail */}
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {cat.imagen_url
                    ? /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={cat.imagen_url} alt={cat.nombre} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <span className="material-symbols-outlined text-base">image</span>
                      </div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{cat.nombre}</p>
                  <p className="text-xs text-gray-400 truncate">
                    /{cat.slug} · orden {cat.orden} · {(cat.productos as { count: number }[])?.[0]?.count ?? 0} productos
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <form action={toggleCategoriaActiva.bind(null, cat.id, cat.activa)}>
                    <button
                      type="submit"
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        cat.activa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {cat.activa ? 'Activa' : 'Inactiva'}
                    </button>
                  </form>
                  <Link
                    href={`/admin/categorias/${cat.id}`}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                  >
                    Editar
                  </Link>
                  <ConfirmDeleteButton
                    action={eliminarCategoria.bind(null, cat.id)}
                    mensaje="¿Eliminar esta categoría?"
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    Eliminar
                  </ConfirmDeleteButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Nueva categoría ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Nueva categoría</h2>
        <form action={crearCategoria} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              required
              placeholder="Ej: Mujer, Hombre, Accesorios..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
            <input
              type="text"
              name="descripcion"
              placeholder="Opcional"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Imagen de portada</label>
            <input
              type="file"
              name="imagen"
              accept="image/*"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 file:mr-3 file:border-0 file:bg-slate-100 file:text-slate-700 file:text-xs file:px-2 file:py-1 file:rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Orden</label>
            <input
              type="number"
              name="orden"
              defaultValue={0}
              min={0}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Crear categoría
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
