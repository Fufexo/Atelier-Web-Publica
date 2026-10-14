import Icon, { type NombreIcono } from './Icon'

interface Props {
  titulo: string
  descripcion?: string
  icono?: NombreIcono
  /** Acción principal, normalmente un enlace para salir del estado vacío. */
  children?: React.ReactNode
}

export default function EmptyState({ titulo, descripcion, icono, children }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      {icono && <Icon name={icono} className="mb-6 size-20 text-stone-200" strokeWidth={1} />}
      <h1 className="mb-3 font-serif text-2xl text-stone-900">{titulo}</h1>
      {descripcion && <p className="mb-8 max-w-sm text-sm text-stone-500">{descripcion}</p>}
      {children}
    </div>
  )
}
