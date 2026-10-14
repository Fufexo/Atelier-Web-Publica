'use client'

interface Props {
  value: number
  onChange: (cantidad: number) => void
  max: number
  min?: number
  /** Nombre del producto, para que los botones digan qué cambian. */
  etiqueta: string
  size?: 'sm' | 'md'
}

/** Selector − n + con límites. Usado en la ficha de producto y en el carrito. */
export default function QuantityStepper({ value, onChange, max, min = 1, etiqueta, size = 'md' }: Props) {
  const celda = size === 'sm' ? 'size-9' : 'size-11'
  const boton = `${celda} flex items-center justify-center text-lg text-stone-500 transition-colors hover:text-stone-900 disabled:cursor-not-allowed disabled:text-stone-200`

  return (
    <div
      className="flex w-fit items-center border border-stone-200"
      role="group"
      aria-label={`Cantidad de ${etiqueta}`}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className={boton}
        aria-label={`Quitar una unidad de ${etiqueta}`}
      >
        −
      </button>
      <output className="w-9 text-center text-sm tabular-nums" aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className={boton}
        aria-label={`Agregar una unidad de ${etiqueta}`}
      >
        +
      </button>
    </div>
  )
}
