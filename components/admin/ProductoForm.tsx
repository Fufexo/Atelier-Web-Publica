'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { guardarProducto } from '@/app/admin/productos/actions'
import { generarSlug } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'
import type { Categoria, Genero, ImagenProducto, Producto, Variante } from '@/lib/types'
import { Alerta, botonAdmin, botonAdminSecundario, Card, inputAdmin, labelAdmin } from './ui'
import VariantesEditor, { type VarianteForm } from './VariantesEditor'

interface Props {
  producto?: Producto & { variantes: Variante[] }
  categorias: Pick<Categoria, 'id' | 'nombre'>[]
}

interface Archivo {
  file: File
  preview: string
}

const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const MAX_MB = 5

export default function ProductoForm({ producto, categorias }: Props) {
  const router = useRouter()
  const [guardando, startTransition] = useTransition()
  const [fase, setFase] = useState<'subiendo' | 'guardando' | null>(null)
  const [error, setError] = useState('')

  const [nombre, setNombre] = useState(producto?.nombre ?? '')
  const [slug, setSlug] = useState(producto?.slug ?? '')
  const [slugManual, setSlugManual] = useState(!!producto)
  const [descripcion, setDescripcion] = useState(producto?.descripcion ?? '')
  const [precio, setPrecio] = useState(producto?.precio?.toString() ?? '')
  const [precioOferta, setPrecioOferta] = useState(producto?.precio_oferta?.toString() ?? '')
  const [categoriaId, setCategoriaId] = useState(producto?.categoria_id ?? '')
  const [sku, setSku] = useState(producto?.sku ?? '')
  const [orden, setOrden] = useState(producto?.orden?.toString() ?? '0')
  const [activo, setActivo] = useState(producto?.activo ?? true)
  const [destacado, setDestacado] = useState(producto?.destacado ?? false)
  const [genero, setGenero] = useState<Genero>(producto?.genero ?? 'unisex')
  const [variantes, setVariantes] = useState<VarianteForm[]>(
    producto?.variantes.map((v) => ({
      id: v.id,
      talla: v.talla ?? '',
      color: v.color ?? '',
      stock: v.stock,
      sku_variante: v.sku_variante ?? '',
      activa: v.activa,
    })) ?? []
  )
  const [imagenes, setImagenes] = useState<ImagenProducto[]>(producto?.imagenes ?? [])
  const [archivos, setArchivos] = useState<Archivo[]>([])

  function onNombreChange(valor: string) {
    setNombre(valor)
    if (!slugManual) setSlug(generarSlug(valor))
  }

  function onArchivos(e: React.ChangeEvent<HTMLInputElement>) {
    const elegidos = Array.from(e.target.files ?? [])
    e.target.value = ''
    const invalido = elegidos.find((f) => !TIPOS_IMAGEN.includes(f.type) || f.size > MAX_MB * 1024 * 1024)
    if (invalido) {
      setError(`"${invalido.name}" no es válida: usa JPG, PNG, WEBP o AVIF de hasta ${MAX_MB} MB.`)
      return
    }
    setArchivos((prev) => [
      ...prev,
      ...elegidos.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ])
  }

  function quitarArchivo(index: number) {
    URL.revokeObjectURL(archivos[index].preview)
    setArchivos((prev) => prev.filter((_, i) => i !== index))
  }

  /** Sube las imágenes nuevas directo a Storage (RLS exige ser admin) y devuelve la lista final. */
  async function subirImagenes(): Promise<ImagenProducto[]> {
    if (archivos.length === 0) return imagenes
    const supabase = createClient()
    const subidas = await Promise.all(
      archivos.map(async ({ file }) => {
        const extension = file.type.split('/')[1]
        const path = `${crypto.randomUUID()}.${extension}`
        const { error: e } = await supabase.storage
          .from('productos')
          .upload(path, file, { cacheControl: '31536000', contentType: file.type })
        if (e) throw new Error(`Error subiendo ${file.name}: ${e.message}`)
        return supabase.storage.from('productos').getPublicUrl(path).data.publicUrl
      })
    )
    return [...imagenes, ...subidas.map((url) => ({ url, alt: nombre, orden: 0 }))].map((img, i) => ({
      ...img,
      orden: i,
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      try {
        setFase('subiendo')
        const imagenesFinales = await subirImagenes()
        setImagenes(imagenesFinales)
        archivos.forEach((a) => URL.revokeObjectURL(a.preview))
        setArchivos([])
        setFase('guardando')
        const resultado = await guardarProducto(producto?.id ?? null, {
          nombre,
          slug,
          descripcion,
          precio: Number(precio),
          precio_oferta: precioOferta ? Number(precioOferta) : null,
          categoria_id: categoriaId || null,
          sku,
          orden: parseInt(orden) || 0,
          imagenes: imagenesFinales,
          activo,
          destacado,
          genero,
          variantes,
        })
        if (resultado?.error) setError(resultado.error)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error inesperado')
      } finally {
        setFase(null)
      }
    })
  }

  const textoBoton =
    fase === 'subiendo'
      ? 'Subiendo imágenes…'
      : guardando
        ? 'Guardando…'
        : producto
          ? 'Guardar cambios'
          : 'Crear producto'

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {error && <Alerta>{error}</Alerta>}

      <Card className="space-y-4 p-6">
        <h2 className="font-semibold text-gray-900">Información básica</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={labelAdmin}>
              Nombre <span className="text-red-500">*</span>
            </span>
            <input
              required
              value={nombre}
              onChange={(e) => onNombreChange(e.target.value)}
              className={inputAdmin}
            />
          </label>
          <label>
            <span className={labelAdmin}>Slug (URL)</span>
            <input
              required
              value={slug}
              onChange={(e) => {
                setSlugManual(true)
                setSlug(e.target.value)
              }}
              className={inputAdmin}
            />
          </label>
          <label>
            <span className={labelAdmin}>SKU</span>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Opcional"
              className={inputAdmin}
            />
          </label>
          <label>
            <span className={labelAdmin}>Posición en tienda</span>
            <input
              type="number"
              min={0}
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className={inputAdmin}
            />
            <span className="mt-1 block text-xs text-gray-500">Número más bajo aparece primero.</span>
          </label>
          <label>
            <span className={labelAdmin}>Categoría</span>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className={inputAdmin}
            >
              <option value="">Sin categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className={labelAdmin}>Descripción</span>
            <textarea
              rows={4}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className={`${inputAdmin} resize-y`}
            />
            <span className="mt-1 block text-xs text-gray-500">
              Deja una línea en blanco para separar párrafos.
            </span>
          </label>
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-semibold text-gray-900">Precios (en soles, IGV incluido)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label>
            <span className={labelAdmin}>
              Precio <span className="text-red-500">*</span>
            </span>
            <input
              type="number"
              required
              min={0.01}
              step="0.01"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className={inputAdmin}
            />
          </label>
          <label>
            <span className={labelAdmin}>Precio oferta</span>
            <input
              type="number"
              min={0.01}
              step="0.01"
              value={precioOferta}
              onChange={(e) => setPrecioOferta(e.target.value)}
              placeholder="Vacío si no hay oferta"
              className={inputAdmin}
            />
          </label>
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-semibold text-gray-900">Imágenes</h2>
        <p className="text-xs text-gray-500">
          La imagen 1 corresponde al primer color, la 2 al segundo, etc.
        </p>

        {(imagenes.length > 0 || archivos.length > 0) && (
          <ul className="flex flex-wrap gap-3">
            {imagenes.map((img, i) => (
              <li key={img.url} className="relative">
                <Image
                  src={img.url}
                  alt={img.alt}
                  width={96}
                  height={96}
                  className="size-24 rounded-lg border border-gray-200 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImagenes((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                  aria-label={`Quitar imagen ${i + 1}`}
                >
                  ×
                </button>
              </li>
            ))}
            {archivos.map((a, i) => (
              <li key={a.preview} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- blob: local, next/image no aplica */}
                <img
                  src={a.preview}
                  alt=""
                  className="size-24 rounded-lg object-cover ring-2 ring-blue-300"
                />
                <button
                  type="button"
                  onClick={() => quitarArchivo(i)}
                  className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                  aria-label={`Quitar ${a.file.name}`}
                >
                  ×
                </button>
                <span className="absolute right-1 bottom-1 rounded bg-blue-500 px-1 text-xs text-white">
                  Nueva
                </span>
              </li>
            ))}
          </ul>
        )}

        <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors focus-within:ring-2 focus-within:ring-slate-500 hover:border-slate-400">
          <span className="text-sm text-gray-500">Click para subir imágenes</span>
          <span className="mt-1 text-xs text-gray-500">JPG, PNG, WEBP o AVIF · hasta {MAX_MB} MB</span>
          <input
            type="file"
            multiple
            accept={TIPOS_IMAGEN.join(',')}
            onChange={onArchivos}
            className="sr-only"
          />
        </label>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-gray-900">Tallas / Colores / Stock</h2>
        <VariantesEditor variantes={variantes} onChange={setVariantes} />
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-semibold text-gray-900">Estado</h2>
        <label className="block">
          <span className={labelAdmin}>Género</span>
          <select
            value={genero}
            onChange={(e) => setGenero(e.target.value as Genero)}
            className={`${inputAdmin} w-auto`}
          >
            <option value="unisex">Unisex</option>
            <option value="mujer">Mujer</option>
            <option value="hombre">Hombre</option>
          </select>
        </label>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
            className="size-4"
          />
          <span>
            <span className="text-sm font-medium text-gray-700">Producto activo</span>
            <span className="block text-xs text-gray-500">Visible en la tienda</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={destacado}
            onChange={(e) => setDestacado(e.target.checked)}
            className="size-4"
          />
          <span>
            <span className="text-sm font-medium text-gray-700">Destacado</span>
            <span className="block text-xs text-gray-500">Aparece primero en la portada y en Novedades</span>
          </span>
        </label>
      </Card>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={guardando} className={botonAdmin}>
          {textoBoton}
        </button>
        <button type="button" onClick={() => router.back()} className={botonAdminSecundario}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
