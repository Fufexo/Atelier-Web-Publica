import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { actualizarCategoria } from '../actions'

export const metadata = { title: 'Editar Categoría — Admin' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarCategoriaPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: cat } = await supabase
    .from('categorias')
    .select('*')
    .eq('id', id)
    .single()

  if (!cat) notFound()

  async function handleSubmit(formData: FormData) {
    'use server'
    await actualizarCategoria(id, formData)
    redirect('/admin/categorias')
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/categorias" className="text-gray-400 hover:text-gray-700 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar categoría</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form action={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              required
              defaultValue={cat.nombre}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
            <input
              type="text"
              name="descripcion"
              defaultValue={cat.descripcion ?? ''}
              placeholder="Opcional"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Orden</label>
            <input
              type="number"
              name="orden"
              defaultValue={cat.orden}
              min={0}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Imagen de portada</label>
            {cat.imagen_url && (
              <div className="mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.imagen_url}
                  alt={cat.nombre}
                  className="w-40 h-52 object-cover rounded-lg border border-gray-200"
                />
                <p className="text-xs text-gray-400 mt-1">Imagen actual — sube una nueva para reemplazarla</p>
              </div>
            )}
            <input
              type="file"
              name="imagen"
              accept="image/*"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 file:mr-3 file:border-0 file:bg-slate-100 file:text-slate-700 file:text-xs file:px-2 file:py-1 file:rounded"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Guardar cambios
            </button>
            <Link
              href="/admin/categorias"
              className="px-5 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
