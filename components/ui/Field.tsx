import type { InputHTMLAttributes, ReactNode } from 'react'

export const inputTienda =
  'w-full border border-stone-200 bg-white px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 transition-colors focus:border-stone-500 focus:outline-none aria-invalid:border-red-500 md:text-sm'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  opcional?: boolean
  error?: string
  className?: string
  /** Para usar otro control (ej. <select>) con el mismo label y error. */
  children?: ReactNode
}

/** Campo de formulario de la tienda: label conectado, error anunciado y estado inválido. */
export default function Field({ id, label, opcional, error, className = '', children, ...input }: Props) {
  const idError = `${id}-error`
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs tracking-widest text-stone-500 uppercase">
        {label} {opcional && <span className="tracking-normal text-stone-500 normal-case">(opcional)</span>}
      </label>
      {children ?? (
        <input
          id={id}
          className={inputTienda}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? idError : undefined}
          {...input}
        />
      )}
      {error && (
        <p id={idError} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
