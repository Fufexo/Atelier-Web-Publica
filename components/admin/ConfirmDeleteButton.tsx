'use client'

interface Props {
  action: (formData: FormData) => Promise<void>
  mensaje?: string
  className?: string
  children: React.ReactNode
}

export default function ConfirmDeleteButton({ action, mensaje = '¿Eliminar?', className, children }: Props) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm(mensaje)) e.preventDefault()
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  )
}
