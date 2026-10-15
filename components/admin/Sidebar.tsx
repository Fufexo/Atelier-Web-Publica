'use client'

import Link, { useLinkStatus } from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/login/actions'
import BotonEnviar from './BotonEnviar'
import ThemeToggle from './ThemeToggle'

const navLinks = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: (
      <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    href: '/admin/productos',
    label: 'Productos',
    icon: (
      <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  },
  {
    href: '/admin/categorias',
    label: 'Categorías',
    icon: (
      <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
    ),
  },
  {
    href: '/admin/pedidos',
    label: 'Pedidos',
    icon: (
      <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
  },
  {
    href: '/admin/analiticas',
    label: 'Analíticas',
    icon: (
      <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
]

/** Punto junto al enlace mientras su sección carga: confirma el clic al instante. */
function IndicadorPendiente() {
  const { pending } = useLinkStatus()
  return (
    <span
      aria-hidden
      data-pendiente={pending || undefined}
      className={`ml-auto size-1.5 rounded-full bg-white transition-opacity ${
        pending ? 'opacity-100 motion-safe:animate-pulse' : 'opacity-0'
      }`}
    />
  )
}

export default function Sidebar() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col bg-slate-900">
      {/* Logo */}
      <div className="border-b border-slate-700 px-6 py-6">
        <p className="text-lg leading-tight font-bold text-white">ATELIER</p>
        <p className="mt-0.5 text-xs text-slate-400">Panel Admin</p>
      </div>

      {/* Nav */}
      <nav aria-label="Panel" className="flex-1 space-y-1 px-3 py-4">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive(link.href) ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive(link.href)
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {link.icon}
            {link.label}
            <IndicadorPendiente />
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="space-y-1 border-t border-slate-700 px-3 py-4">
        <ThemeToggle />
        <form action={logout} className="mt-1">
          <BotonEnviar
            pendiente="Saliendo…"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Cerrar sesión
          </BotonEnviar>
        </form>
      </div>
    </aside>
  )
}
