import type { ProductoResumen } from '@/lib/types'
import ProductCard from './ProductCard'

interface Props {
  productos: ProductoResumen[]
  /** Columnas desde `lg`. */
  columnas?: 3 | 4
}

/**
 * Carrusel con snap en móvil y grilla desde `md`. Es una sola lista: antes había
 * dos copias del DOM (una oculta por breakpoint), lo que duplicaba imágenes y enlaces.
 */
export default function ProductGrid({ productos, columnas = 4 }: Props) {
  return (
    <ul
      className={`-mx-6 flex snap-x snap-mandatory scrollbar-none overflow-x-auto pb-4 md:mx-0 md:grid md:snap-none md:gap-x-6 md:gap-y-12 md:overflow-visible md:pb-0 ${
        columnas === 4 ? 'md:grid-cols-3 lg:grid-cols-4' : 'md:grid-cols-3'
      }`}
    >
      {productos.map((prod, i) => (
        <li key={prod.id} className="w-full shrink-0 snap-center px-6 md:w-auto md:px-0">
          <ProductCard prod={prod} prioridad={i < 4} />
        </li>
      ))}
    </ul>
  )
}
