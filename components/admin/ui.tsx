import Link from 'next/link'
import { ESTADO_PAGO, ESTADO_PEDIDO } from '@/lib/pedidos'
import type { EstadoPago, EstadoPedido } from '@/lib/types'

// Piezas compartidas del panel. Antes cada página repetía las mismas clases.

export const inputAdmin =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none'

export const labelAdmin = 'mb-1.5 block text-sm font-medium text-gray-700'

export const botonAdmin =
  'inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50'

export const botonAdminSecundario =
  'inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-gray-200 bg-white ${className}`}>{children}</section>
}

export function CardHeader({ titulo, children }: { titulo: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
      <h2 className="font-semibold text-gray-900">{titulo}</h2>
      {children}
    </div>
  )
}

/** Título de página con enlace opcional de vuelta ("← Productos / Editar"). */
export function AdminHeader({
  titulo,
  volver,
  children,
}: {
  titulo: React.ReactNode
  volver?: { href: string; label: string }
  children?: React.ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {volver && (
          <>
            <Link href={volver.href} className="text-gray-500 hover:text-gray-700">
              ← {volver.label}
            </Link>
            <span className="text-gray-300" aria-hidden>
              /
            </span>
          </>
        )}
        <h1 className="text-2xl font-bold text-gray-900">{titulo}</h1>
      </div>
      {children}
    </div>
  )
}

export function EstadoPedidoBadge({ estado }: { estado: EstadoPedido }) {
  const { badge, label } = ESTADO_PEDIDO[estado]
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badge}`}>{label}</span>
  )
}

export function EstadoPagoBadge({ estado }: { estado: EstadoPago }) {
  const { badge, label } = ESTADO_PAGO[estado]
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badge}`}>{label}</span>
  )
}

export function Alerta({
  children,
  tono = 'error',
}: {
  children: React.ReactNode
  tono?: 'error' | 'aviso'
}) {
  const clases =
    tono === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-800'
  return (
    <div
      role={tono === 'error' ? 'alert' : 'status'}
      className={`rounded-lg border px-4 py-3 text-sm ${clases}`}
    >
      {children}
    </div>
  )
}
