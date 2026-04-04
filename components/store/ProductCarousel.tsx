import type { Producto } from '@/lib/types'
import ProductCard from './ProductCard'

interface Props {
  productos: Producto[]
}

export default function ProductCarousel({ productos }: Props) {
  const visibles = productos.slice(0, 4)

  return (
    <>
      {/* Mobile: carrusel 1 producto, snap, sin scrollbar */}
      <div
        className="md:hidden -mx-8 overflow-x-auto snap-x snap-mandatory flex pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {visibles.map((prod) => (
          <div key={prod.id} className="snap-center shrink-0 w-full px-8">
            <ProductCard prod={prod} hover={false} />
          </div>
        ))}
      </div>

      {/* Desktop: grid */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        {visibles.map((prod) => (
          <ProductCard key={prod.id} prod={prod} />
        ))}
      </div>
    </>
  )
}
