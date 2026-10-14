'use client'

import Link from 'next/link'
import Icon from '@/components/ui/Icon'
import { useCarrito } from '@/lib/carrito'

export default function BotonCarrito() {
  const { totalItems } = useCarrito()
  const etiqueta =
    totalItems > 0 ? `Carrito, ${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}` : 'Carrito'

  return (
    <Link
      href="/carrito"
      aria-label={etiqueta}
      className="relative flex size-11 items-center justify-center text-stone-500 transition-colors hover:text-stone-900"
    >
      <Icon name="bolsa" className="size-6" />
      {totalItems > 0 && (
        <span
          aria-hidden
          className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-stone-900 text-[10px] text-white"
        >
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </Link>
  )
}
