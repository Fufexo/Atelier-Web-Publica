import Link from 'next/link'
import { Suspense } from 'react'
import { NAV_PRINCIPAL } from '@/lib/navigation'
import BotonCarrito from './BotonCarrito'
import MenuMovil from './MenuMovil'
import NavLinks, { NavLinksBase } from './NavLinks'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-100 bg-white/90 backdrop-blur-md">
      <nav
        aria-label="Principal"
        className="mx-auto flex w-full max-w-[1920px] items-center justify-between px-4 py-4 md:px-8 md:py-5"
      >
        <div className="flex items-center gap-2">
          <MenuMovil enlaces={NAV_PRINCIPAL} />
          <Link href="/" className="font-serif text-2xl tracking-tighter text-stone-900">
            ATELIER
          </Link>
        </div>

        {/* useSearchParams necesita Suspense; el fallback son los mismos links sin estado activo. */}
        <Suspense fallback={<NavLinksBase enlaces={NAV_PRINCIPAL} />}>
          <NavLinks enlaces={NAV_PRINCIPAL} />
        </Suspense>

        <BotonCarrito />
      </nav>
    </header>
  )
}
