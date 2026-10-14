interface Props {
  titulo: React.ReactNode
  descripcion?: React.ReactNode
  /** Texto pequeño en mayúsculas sobre el título. */
  antetitulo?: string
  className?: string
}

/** Encabezado de página de la tienda: antetítulo, título serif y bajada. */
export default function PageHeader({ titulo, descripcion, antetitulo, className = 'mb-10' }: Props) {
  return (
    <header className={className}>
      {antetitulo && <p className="mb-2 text-xs tracking-[0.3em] text-stone-600 uppercase">{antetitulo}</p>}
      <h1 className="font-serif text-3xl text-stone-900 md:text-4xl">{titulo}</h1>
      {descripcion && <p className="mt-2 text-sm text-stone-600">{descripcion}</p>}
    </header>
  )
}
