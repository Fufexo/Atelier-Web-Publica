import { notFound } from 'next/navigation'
import { Link } from 'next-view-transitions'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import ProductoDetalle from './ProductoDetalle'
import { formatearPrecio } from '@/lib/utils'
import type { ImagenProducto, Variante } from '@/lib/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('productos').select('nombre, descripcion').eq('slug', slug).single()
  if (!data) return { title: 'Producto no encontrado' }
  return { title: `${data.nombre} — Atelier`, description: data.descripcion ?? undefined }
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: prod } = await supabase
    .from('productos')
    .select('*, categorias(nombre, slug), variantes(*)')
    .eq('slug', slug)
    .eq('activo', true)
    .single()

  if (!prod) notFound()

  const imagenes = (prod.imagenes as ImagenProducto[]) ?? []
  const variantes = (prod.variantes as Variante[]) ?? []
  const categoria = prod.categorias as { nombre: string; slug: string } | null
  const precioMostrar = prod.precio_oferta ?? prod.precio

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-12">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-stone-400 mb-10" style={{ fontFamily: 'var(--font-manrope)' }}>
            <Link href="/" className="hover:text-stone-700 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/tienda" className="hover:text-stone-700 transition-colors">Tienda</Link>
            {categoria && (
              <>
                <span>/</span>
                <Link href={`/tienda?categoria=${categoria.slug}`} className="hover:text-stone-700 transition-colors">
                  {categoria.nombre}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-stone-600">{prod.nombre}</span>
          </nav>

          {/* Categoría y nombre (server rendered para SEO) */}
          <div className="mb-8">
            {categoria && (
              <p className="text-xs uppercase tracking-[0.3em] text-stone-400 mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>
                {categoria.nombre}
              </p>
            )}
            <h1 className="text-3xl md:text-4xl text-stone-900 leading-tight" style={{ fontFamily: 'var(--font-noto-serif)' }}>
              {prod.nombre}
            </h1>
          </div>

          <ProductoDetalle
            productoId={prod.id}
            slug={prod.slug}
            nombre={prod.nombre}
            precio={prod.precio}
            precioOferta={prod.precio_oferta}
            imagenes={imagenes}
            variantes={variantes}
          />

          {/* Descripción */}
          {prod.descripcion && (
            <div className="mt-12 pt-8 border-t border-stone-100 max-w-xl">
              <p className="text-sm text-stone-500 leading-relaxed" style={{ fontFamily: 'var(--font-manrope)' }}>
                {prod.descripcion}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
