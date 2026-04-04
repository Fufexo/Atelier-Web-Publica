'use client'

import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const { dark, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
    >
      <span className="flex items-center gap-3">
        {dark ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
        {dark ? 'Modo claro' : 'Modo oscuro'}
      </span>

      {/* Switch visual */}
      <div className={`relative w-10 h-5 rounded-full transition-colors ${dark ? 'bg-indigo-500' : 'bg-slate-600'}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${dark ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </div>
    </button>
  )
}
