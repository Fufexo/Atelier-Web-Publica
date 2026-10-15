'use client'

import { useFormStatus } from 'react-dom'

interface Props extends Omit<React.ComponentProps<'button'>, 'type'> {
  /** Texto mientras el servidor responde. Sin él se mantiene el texto, con el indicador. */
  pendiente?: React.ReactNode
}

/**
 * Botón de envío para formularios con Server Action. Mientras espera al servidor se
 * deshabilita (evita el doble envío) y muestra un indicador: sin esto, una acción lenta
 * (p. ej. el login con un arranque en frío) parece una página congelada.
 */
export default function BotonEnviar({ pendiente, children, disabled, className = '', ...props }: Props) {
  const { pending } = useFormStatus()

  return (
    <button
      {...props}
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={`${className} ${pending ? 'cursor-wait' : ''}`}
    >
      {pending && (
        <span
          aria-hidden
          className="mr-1.5 inline-block size-[1em] animate-spin rounded-full border-2 border-current border-t-transparent align-[-0.125em] motion-reduce:animate-none"
        />
      )}
      {pending ? (pendiente ?? children) : children}
    </button>
  )
}
