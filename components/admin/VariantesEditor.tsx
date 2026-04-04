'use client'

import { useState } from 'react'
import type { VarianteInput } from '@/app/admin/productos/actions'

const TALLAS_ROPA = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Único']
const TALLAS_PANTALON = ['26', '28', '30', '32', '34', '36', '38', '40']

interface Props {
  inicial?: VarianteInput[]
  onChange: (variantes: VarianteInput[]) => void
}

export default function VariantesEditor({ inicial = [], onChange }: Props) {
  const [variantes, setVariantes] = useState<VarianteInput[]>(inicial)

  function actualizar(index: number, campo: keyof VarianteInput, valor: string | number | boolean) {
    const nuevas = variantes.map((v, i) =>
      i === index ? { ...v, [campo]: valor } : v
    )
    setVariantes(nuevas)
    onChange(nuevas)
  }

  function agregar() {
    const nuevas = [
      ...variantes,
      { talla: '', color: '', stock: 0, sku_variante: '', activa: true },
    ]
    setVariantes(nuevas)
    onChange(nuevas)
  }

  function eliminar(index: number) {
    const nuevas = variantes.filter((_, i) => i !== index)
    setVariantes(nuevas)
    onChange(nuevas)
  }

  return (
    <div className="space-y-3">
      {variantes.length === 0 && (
        <p className="text-sm text-gray-400 italic">
          Sin variantes — el producto se vende sin talla ni color.
        </p>
      )}

      {variantes.map((v, i) => (
        <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Talla</label>
            <input
              list="tallas-sugeridas"
              value={v.talla}
              onChange={(e) => actualizar(i, 'talla', e.target.value)}
              placeholder="S, M, L, 32..."
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Color</label>
            <input
              value={v.color}
              onChange={(e) => actualizar(i, 'color', e.target.value)}
              placeholder="Negro, Rojo..."
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div className="w-24">
            <label className="block text-xs text-gray-500 mb-1">Stock</label>
            <input
              type="number"
              min={0}
              value={v.stock}
              onChange={(e) => actualizar(i, 'stock', parseInt(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">SKU variante</label>
            <input
              value={v.sku_variante}
              onChange={(e) => actualizar(i, 'sku_variante', e.target.value)}
              placeholder="Opcional"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div className="pt-4">
            <button
              type="button"
              onClick={() => eliminar(i)}
              className="text-red-400 hover:text-red-600 transition-colors"
              title="Eliminar variante"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}

      <datalist id="tallas-sugeridas">
        {[...TALLAS_ROPA, ...TALLAS_PANTALON].map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>

      <button
        type="button"
        onClick={agregar}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Agregar talla / color
      </button>
    </div>
  )
}
