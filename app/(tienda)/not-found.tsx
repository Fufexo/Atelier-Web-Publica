import Link from 'next/link'
import EmptyState from '@/components/ui/EmptyState'
import { boton } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-1 bg-white">
      <EmptyState
        titulo="No encontramos esta página"
        descripcion="Puede que el producto ya no esté disponible o que el enlace tenga un error."
      >
        <Link href="/tienda" className={boton()}>
          Ver la tienda
        </Link>
      </EmptyState>
    </div>
  )
}
