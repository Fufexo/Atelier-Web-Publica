import type { Metadata } from 'next'
import Link from 'next/link'
import EmptyState from '@/components/ui/EmptyState'
import { boton } from '@/components/ui/button'
import { numeroPedido } from '@/lib/format'

export const metadata: Metadata = { title: 'Pedido confirmado', robots: { index: false } }

export default async function ConfirmacionPage({ searchParams }: PageProps<'/checkout/confirmacion'>) {
  const { numero } = await searchParams
  const valido = typeof numero === 'string' && /^\d{1,9}$/.test(numero)

  return (
    <div className="flex flex-1 bg-white">
      <EmptyState
        icono="check"
        titulo="¡Pedido confirmado!"
        descripcion={`${valido ? `Pedido ${numeroPedido(numero)}. ` : ''}Tu pago fue procesado con éxito y te enviamos el detalle por correo. Te contactaremos pronto para coordinar el envío.`}
      >
        <Link href="/tienda" className={boton()}>
          Seguir comprando
        </Link>
      </EmptyState>
    </div>
  )
}
