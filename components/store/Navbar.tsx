'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCarrito } from '@/lib/carrito'

const links = [
  { href: '/tienda?genero=mujer', label: 'Mujer' },
  { href: '/tienda?genero=hombre', label: 'Hombre' },
  { href: '/tienda?novedad=true', label: 'Novedades', scrollId: 'nuevos-ingresos' },
  { href: '/tienda', label: 'Colecciones' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { totalItems } = useCarrito()

  return (
    <header className="bg-white/90 backdrop-blur-md top-0 z-50 border-b border-stone-100 sticky">
      <nav className="flex justify-between items-center w-full px-8 py-5 max-w-[1920px] mx-auto">
        {/* Logo */}
        <Link href="/" className="text-2xl tracking-tighter text-stone-900" style={{ fontFamily: 'var(--font-noto-serif)' }}>
          ATELIER
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-10">
          {links.map((link) => {
            const isHome = pathname === '/'
            const isActive = (isHome && !!link.scrollId) || pathname === link.href

            const handleClick = isHome && link.scrollId
              ? (e: React.MouseEvent) => {
                  e.preventDefault()
                  document.getElementById(link.scrollId!)?.scrollIntoView({ behavior: 'smooth' })
                }
              : undefined

            return (
              <Link
                key={link.href}
                href={isHome && link.scrollId ? '#' : link.href}
                onClick={handleClick}
                className={`text-sm uppercase tracking-widest transition-colors ${
                  isActive
                    ? 'text-stone-900 border-b border-stone-900 pb-0.5'
                    : 'text-stone-400 hover:text-stone-900'
                }`}
                style={{ fontFamily: 'var(--font-manrope)' }}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-4">
          <Link href="/carrito" className="relative p-2 transition-colors" aria-label="Carrito">
            <span className="material-symbols-outlined text-stone-400 hover:text-stone-900 transition-colors">shopping_bag</span>
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-stone-900 text-white text-[10px] flex items-center justify-center rounded-full" style={{ fontFamily: 'var(--font-manrope)' }}>
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  )
}
