'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({
  dark: false,
  toggle: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('admin-theme')
    if (saved === 'dark') setDark(true)
    setMounted(true)
  }, [])

  function toggle() {
    setDark((prev) => {
      const next = !prev
      localStorage.setItem('admin-theme', next ? 'dark' : 'light')
      return next
    })
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-gray-50" style={{ colorScheme: 'light' }}>
        {children}
      </div>
    )
  }

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <div
        data-theme={dark ? 'dark' : 'light'}
        className="flex min-h-screen bg-gray-50"
        style={{ colorScheme: dark ? 'dark' : 'light' }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}
