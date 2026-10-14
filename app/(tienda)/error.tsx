'use client'

import Link from 'next/link'
import EmptyState from '@/components/ui/EmptyState'
import { boton } from '@/components/ui/button'

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-1 bg-white">
      <EmptyState
        titulo="Algo salió mal"
        descripcion="No pudimos cargar esta página. Intenta de nuevo en unos segundos."
      >
        <div className="flex gap-4">
          <button type="button" onClick={reset} className={boton()}>
            Reintentar
          </button>
          <Link href="/" className={boton({ variante: 'enlace', className: 'self-center' })}>
            Ir al inicio
          </Link>
        </div>
      </EmptyState>
    </div>
  )
}
