'use client'

import { useEffect } from 'react'

// Suprime el InvalidStateError de next-view-transitions cuando el usuario
// navega rápido y dos transiciones se solapan. Es inofensivo — la transición
// simplemente se cancela — pero sin esto Next.js lo reporta como unhandledRejection.
export default function ViewTransitionGuard() {
  useEffect(() => {
    function handler(e: PromiseRejectionEvent) {
      if (
        e.reason?.name === 'InvalidStateError' &&
        typeof e.reason?.message === 'string' &&
        e.reason.message.includes('Transition was aborted')
      ) {
        e.preventDefault()
      }
    }
    window.addEventListener('unhandledrejection', handler)
    return () => window.removeEventListener('unhandledrejection', handler)
  }, [])

  return null
}
