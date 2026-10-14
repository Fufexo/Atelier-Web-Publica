'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { estaActivo, type EnlaceNav } from '@/lib/navigation'

interface Props {
  enlaces: EnlaceNav[]
}

/** Links sin estado activo: fallback de Suspense mientras no hay searchParams. */
export function NavLinksBase({ enlaces, activo }: Props & { activo?: (href: string) => boolean }) {
  return (
    <ul className="hidden items-center gap-10 md:flex">
      {enlaces.map((link) => {
        const actual = activo?.(link.href) ?? false
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={actual ? 'page' : undefined}
              className={`text-sm tracking-widest uppercase transition-colors ${
                actual
                  ? 'border-b border-stone-900 pb-0.5 text-stone-900'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {link.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default function NavLinks({ enlaces }: Props) {
  const pathname = usePathname()
  const params = useSearchParams()
  return <NavLinksBase enlaces={enlaces} activo={(href) => estaActivo(href, pathname, params)} />
}
