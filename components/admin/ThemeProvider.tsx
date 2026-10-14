'use client'

import { createContext, use, useSyncExternalStore } from 'react'

const CLAVE = 'admin-theme'
const listeners = new Set<() => void>()

function leerOscuro(): boolean {
  try {
    return localStorage.getItem(CLAVE) === 'dark'
  } catch {
    return false
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function alternar() {
  try {
    localStorage.setItem(CLAVE, leerOscuro() ? 'light' : 'dark')
  } catch {
    // Sin almacenamiento no se recuerda la preferencia.
  }
  listeners.forEach((l) => l())
}

const ThemeContext = createContext({ dark: false, toggle: alternar })

export function useTheme() {
  return use(ThemeContext)
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const dark = useSyncExternalStore(subscribe, leerOscuro, () => false)

  return (
    <ThemeContext value={{ dark, toggle: alternar }}>
      <div data-theme={dark ? 'dark' : 'light'} className="flex min-h-screen bg-gray-50">
        {children}
      </div>
    </ThemeContext>
  )
}
