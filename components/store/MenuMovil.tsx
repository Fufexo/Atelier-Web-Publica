'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import Icon from '@/components/ui/Icon'
import { NAV_AYUDA, type EnlaceNav } from '@/lib/navigation'

/**
 * Menú de navegación para pantallas chicas: panel a pantalla completa que recibe
 * el foco al abrir, cierra con Esc y lo devuelve al botón que lo abrió.
 */
export default function MenuMovil({ enlaces }: { enlaces: EnlaceNav[] }) {
  const [abierto, setAbierto] = useState(false)
  const abrir = useRef<HTMLButtonElement>(null)
  const cerrarRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!abierto) return
    cerrarRef.current?.focus()
    function alPresionar(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      setAbierto(false)
      abrir.current?.focus()
    }
    document.addEventListener('keydown', alPresionar)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', alPresionar)
      document.body.style.overflow = ''
    }
  }, [abierto])

  function cerrar() {
    setAbierto(false)
    abrir.current?.focus()
  }

  return (
    <div className="md:hidden">
      <button
        ref={abrir}
        type="button"
        onClick={() => setAbierto(true)}
        aria-expanded={abierto}
        aria-controls="menu-movil"
        className="-ml-2 flex size-11 items-center justify-center text-stone-700"
      >
        <Icon name="menu" className="size-6" label="Abrir menú" />
      </button>

      {abierto && (
        <div
          id="menu-movil"
          role="dialog"
          aria-modal="true"
          aria-label="Menú"
          className="fixed inset-0 z-60 overflow-y-auto bg-white px-4 pt-4 pb-10"
        >
          <button
            ref={cerrarRef}
            type="button"
            onClick={cerrar}
            className="-ml-2 flex size-11 items-center justify-center text-stone-700"
          >
            <Icon name="cerrar" className="size-6" label="Cerrar menú" />
          </button>

          <ul className="mt-6 space-y-1 px-2">
            {enlaces.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setAbierto(false)}
                  className="block py-3 font-serif text-2xl text-stone-900"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-10 mb-3 px-2 text-xs tracking-widest text-stone-500 uppercase">Ayuda</p>
          <ul className="px-2">
            {NAV_AYUDA.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setAbierto(false)}
                  className="block py-2.5 text-sm text-stone-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
