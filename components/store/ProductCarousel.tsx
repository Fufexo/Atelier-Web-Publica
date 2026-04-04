import Link from 'next/link'
import { formatearPrecio } from '@/lib/utils'
import type { Producto, ImagenProducto } from '@/lib/types'

interface Props {
  productos: Producto[]
}

export default function ProductCarousel({ productos }: Props) {
  const visibles = productos.slice(0, 4)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
      {visibles.map((prod) => {
        const imagen = (prod.imagenes as ImagenProducto[])?.[0]
        const precioMostrar = prod.precio_oferta ?? prod.precio
        const catNombre = (prod.categorias as { nombre: string } | null)?.nombre ?? ''

        return (
          <article key={prod.id} className="group">
            <div className="relative mb-4">
              <Link href={`/producto/${prod.slug}`} className="block relative">
                <div className="aspect-3/4 bg-[#f0ede8] overflow-hidden">
                  {imagen ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imagen.url}
                      alt={imagen.alt || prod.nombre}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <span className="material-symbols-outlined text-6xl">deployed_code</span>
                    </div>
                  )}
                </div>
                <div className="absolute left-4 right-4 bottom-4 bg-stone-900 text-white py-3 text-xs uppercase tracking-[0.14em] text-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" style={{ fontFamily: 'var(--font-manrope)' }}>
                  Añadir al carrito
                </div>
              </Link>

            </div>

            <Link href={`/producto/${prod.slug}`} className="block">
              {catNombre && (
                <p className="text-[11px] uppercase tracking-widest text-stone-400 mb-1 truncate" style={{ fontFamily: 'var(--font-manrope)' }}>
                  {catNombre}
                </p>
              )}
              <h4 className="text-sm font-medium text-stone-900 mb-1 leading-5 group-hover:underline underline-offset-2" style={{ fontFamily: 'var(--font-manrope)' }}>
                {prod.nombre}
              </h4>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm text-stone-600" style={{ fontFamily: 'var(--font-manrope)' }}>
                  {formatearPrecio(precioMostrar)}
                </p>
                {prod.precio_oferta && (
                  <p className="text-xs text-stone-400 line-through" style={{ fontFamily: 'var(--font-manrope)' }}>
                    {formatearPrecio(prod.precio)}
                  </p>
                )}
              </div>
            </Link>
          </article>
        )
      })}
    </div>
  )
}
