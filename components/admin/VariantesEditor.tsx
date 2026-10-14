'use client'

import type { VarianteInput } from '@/app/admin/productos/schema'

const TALLAS_SUGERIDAS = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  'Único',
  '26',
  '28',
  '30',
  '32',
  '34',
  '36',
  '38',
  '40',
]

const input =
  'w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:ring-1 focus:ring-slate-500 focus:outline-none'

export type VarianteForm = Omit<VarianteInput, 'talla' | 'color' | 'sku_variante'> & {
  talla: string
  color: string
  sku_variante: string
}

interface Props {
  variantes: VarianteForm[]
  onChange: (variantes: VarianteForm[]) => void
}

/** Editor controlado de tallas / colores / stock. */
export default function VariantesEditor({ variantes, onChange }: Props) {
  function actualizar<K extends keyof VarianteForm>(index: number, campo: K, valor: VarianteForm[K]) {
    onChange(variantes.map((v, i) => (i === index ? { ...v, [campo]: valor } : v)))
  }

  return (
    <div className="space-y-3">
      {variantes.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          Sin variantes: agrega al menos una para que el producto se pueda comprar.
        </p>
      )}

      {variantes.map((v, i) => (
        <fieldset
          key={v.id ?? `nueva-${i}`}
          className="flex flex-wrap items-end gap-3 rounded-lg bg-gray-50 p-3"
        >
          <legend className="sr-only">Variante {i + 1}</legend>
          <label className="min-w-24 flex-1">
            <span className="mb-1 block text-xs text-gray-500">Talla</span>
            <input
              list="tallas-sugeridas"
              value={v.talla}
              onChange={(e) => actualizar(i, 'talla', e.target.value)}
              placeholder="S, M, 32…"
              className={input}
            />
          </label>
          <label className="min-w-24 flex-1">
            <span className="mb-1 block text-xs text-gray-500">Color</span>
            <input
              value={v.color}
              onChange={(e) => actualizar(i, 'color', e.target.value)}
              placeholder="Negro, Rojo…"
              className={input}
            />
          </label>
          <label className="w-24">
            <span className="mb-1 block text-xs text-gray-500">Stock</span>
            <input
              type="number"
              min={0}
              value={v.stock}
              onChange={(e) => actualizar(i, 'stock', Math.max(0, parseInt(e.target.value) || 0))}
              className={input}
            />
          </label>
          <label className="min-w-24 flex-1">
            <span className="mb-1 block text-xs text-gray-500">SKU variante</span>
            <input
              value={v.sku_variante}
              onChange={(e) => actualizar(i, 'sku_variante', e.target.value)}
              placeholder="Opcional"
              className={input}
            />
          </label>
          <label className="flex items-center gap-2 pb-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={v.activa}
              onChange={(e) => actualizar(i, 'activa', e.target.checked)}
            />
            Activa
          </label>
          <button
            type="button"
            onClick={() => onChange(variantes.filter((_, j) => j !== i))}
            className="pb-2 text-sm text-red-500 hover:text-red-700"
            aria-label={`Eliminar variante ${i + 1}`}
          >
            Eliminar
          </button>
        </fieldset>
      ))}

      <datalist id="tallas-sugeridas">
        {TALLAS_SUGERIDAS.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>

      <button
        type="button"
        onClick={() =>
          onChange([...variantes, { talla: '', color: '', stock: 0, sku_variante: '', activa: true }])
        }
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        + Agregar talla / color
      </button>
    </div>
  )
}
