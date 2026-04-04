'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generarSlug } from '@/lib/utils'
import VariantesEditor from './VariantesEditor'
import { crearProducto, actualizarProducto } from '@/app/admin/productos/actions'
import type { Producto, Categoria, ImagenProducto } from '@/lib/types'
import type { VarianteInput } from '@/app/admin/productos/actions'

interface Props {
  producto?: Producto
  categorias: Categoria[]
}

export default function ProductoForm({ producto, categorias }: Props) {
  const router = useRouter()
  const esEdicion = !!producto

  const [nombre, setNombre] = useState(producto?.nombre ?? '')
  const [slug, setSlug] = useState(producto?.slug ?? '')
  const [descripcion, setDescripcion] = useState(producto?.descripcion ?? '')
  const [precio, setPrecio] = useState(producto?.precio?.toString() ?? '')
  const [precioOferta, setPrecioOferta] = useState(producto?.precio_oferta?.toString() ?? '')
  const [categoriaId, setCategoriaId] = useState(producto?.categoria_id ?? '')
  const [sku, setSku] = useState(producto?.sku ?? '')
  const [orden, setOrden] = useState((producto as { orden?: number })?.orden?.toString() ?? '0')
  const [activo, setActivo] = useState(producto?.activo ?? true)
  const [destacado, setDestacado] = useState(producto?.destacado ?? false)
  const [genero, setGenero] = useState<'hombre' | 'mujer' | 'unisex'>(producto?.genero ?? 'unisex')
  const [variantes, setVariantes] = useState<VarianteInput[]>(
    producto?.variantes?.map((v) => ({
      talla: v.talla ?? '',
      color: v.color ?? '',
      stock: v.stock,
      sku_variante: v.sku_variante ?? '',
      activa: v.activa,
    })) ?? []
  )
  const [imagenes, setImagenes] = useState<ImagenProducto[]>(producto?.imagenes ?? [])
  const [archivos, setArchivos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  function onNombreChange(valor: string) {
    setNombre(valor)
    setSlug(generarSlug(valor))
  }

  function onArchivoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setArchivos((prev) => [...prev, ...files])
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews((prev) => [...prev, ...urls])
  }

  function eliminarImagenExistente(index: number) {
    setImagenes((prev) => prev.filter((_, i) => i !== index))
  }

  function eliminarPreview(index: number) {
    URL.revokeObjectURL(previews[index])
    setArchivos((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  async function subirImagenes(): Promise<ImagenProducto[]> {
    if (archivos.length === 0) return imagenes

    const supabase = createClient()
    const nuevas: ImagenProducto[] = [...imagenes]

    for (let i = 0; i < archivos.length; i++) {
      const archivo = archivos[i]
      const extension = archivo.name.split('.').pop()
      const path = `${Date.now()}-${i}.${extension}`

      const { error: errUpload } = await supabase.storage
        .from('productos')
        .upload(path, archivo, { cacheControl: '3600', upsert: false })

      if (errUpload) throw new Error(`Error subiendo imagen: ${errUpload.message}`)

      const { data } = supabase.storage.from('productos').getPublicUrl(path)
      nuevas.push({
        url: data.publicUrl,
        alt: nombre || archivo.name,
        orden: nuevas.length,
      })
    }

    return nuevas
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setGuardando(true)

    try {
      setSubiendo(true)
      const imagenesFinales = await subirImagenes()
      setSubiendo(false)

      const data = {
        nombre,
        slug,
        descripcion,
        precio: parseFloat(precio),
        precio_oferta: precioOferta ? parseFloat(precioOferta) : null,
        categoria_id: categoriaId || null,
        sku: sku || null,
        orden: parseInt(orden) || 0,
        imagenes: imagenesFinales,
        activo,
        destacado,
        genero,
        variantes,
      }

      if (esEdicion) {
        const result = await actualizarProducto(producto.id, data)
        if (result?.error) setError(result.error)
      } else {
        const result = await crearProducto(data)
        if (result?.error) setError(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
      setGuardando(false)
      setSubiendo(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Información básica */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Información básica</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => onNombreChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Slug (URL)
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Opcional"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Posición en tienda
            </label>
            <input
              type="number"
              min={0}
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
            <p className="text-xs text-gray-400 mt-1">Número más bajo aparece primero. 0 = sin orden preferente.</p>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoría</label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="">Sin categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
            <textarea
              rows={4}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none"
            />
          </div>
        </div>
      </section>

      {/* Precios */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Precios (en soles)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Precio <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm text-gray-400">S/.</span>
              <input
                type="number"
                required
                min={0}
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Precio oferta
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm text-gray-400">S/.</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={precioOferta}
                onChange={(e) => setPrecioOferta(e.target.value)}
                placeholder="Dejar vacío si no hay oferta"
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Imágenes */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Imágenes</h2>

        {/* Imágenes existentes */}
        {imagenes.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {imagenes.map((img, i) => (
              <div key={i} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => eliminarImagenExistente(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Previews de nuevas imágenes */}
        {previews.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {previews.map((url, i) => (
              <div key={i} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg border border-blue-200 ring-2 ring-blue-300"
                />
                <button
                  type="button"
                  onClick={() => eliminarPreview(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                <span className="absolute bottom-1 right-1 bg-blue-500 text-white text-xs px-1 rounded">
                  Nueva
                </span>
              </div>
            ))}
          </div>
        )}

        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-slate-400 transition-colors bg-gray-50">
          <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm text-gray-500">Click para subir imágenes</span>
          <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onArchivoChange}
            className="hidden"
          />
        </label>
      </section>

      {/* Variantes */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Tallas / Colores / Stock</h2>
        <VariantesEditor inicial={variantes} onChange={setVariantes} />
      </section>

      {/* Estado */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Estado</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Género</label>
            <select
              value={genero}
              onChange={(e) => setGenero(e.target.value as 'hombre' | 'mujer' | 'unisex')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="unisex">Unisex</option>
              <option value="mujer">Mujer</option>
              <option value="hombre">Hombre</option>
            </select>
          </div>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-slate-900 focus:ring-slate-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Producto activo</span>
              <p className="text-xs text-gray-400">Visible en la tienda</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={destacado}
              onChange={(e) => setDestacado(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-slate-900 focus:ring-slate-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Destacado</span>
              <p className="text-xs text-gray-400">Aparece en la página principal</p>
            </div>
          </label>
        </div>
        </div>
      </section>

      {/* Botones */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={guardando}
          className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          {subiendo ? 'Subiendo imágenes...' : guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-white border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
