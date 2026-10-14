'use client'

import { useState } from 'react'

type Unidad = 'cm' | 'in'

function cm(val: number, unidad: Unidad) {
  if (unidad === 'cm') return `${val} cm`
  return `${(val / 2.54).toFixed(1)}"`
}

const ROPA = [
  { talla: 'XS', pecho: 82, cintura: 62, cadera: 88 },
  { talla: 'S', pecho: 88, cintura: 68, cadera: 94 },
  { talla: 'M', pecho: 94, cintura: 74, cadera: 100 },
  { talla: 'L', pecho: 100, cintura: 80, cadera: 106 },
  { talla: 'XL', pecho: 108, cintura: 88, cadera: 114 },
  { talla: 'XXL', pecho: 116, cintura: 96, cadera: 122 },
]

const PANTALONES = [
  { talla: '28', cintura: 71, cadera: 89, largo: 100 },
  { talla: '30', cintura: 76, cadera: 94, largo: 101 },
  { talla: '32', cintura: 81, cadera: 99, largo: 102 },
  { talla: '34', cintura: 86, cadera: 104, largo: 103 },
  { talla: '36', cintura: 91, cadera: 109, largo: 104 },
  { talla: '38', cintura: 96, cadera: 114, largo: 105 },
]

export default function GuiaTallas() {
  const [unidad, setUnidad] = useState<Unidad>('cm')

  return (
    <div className="space-y-14">
      {/* Toggle */}
      <div className="flex w-fit items-center gap-1 border border-stone-200">
        {(['cm', 'in'] as Unidad[]).map((u) => (
          <button
            key={u}
            onClick={() => setUnidad(u)}
            className={`px-5 py-2 text-xs tracking-widest uppercase transition-colors ${
              unidad === u ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            {u === 'cm' ? 'Centímetros' : 'Pulgadas'}
          </button>
        ))}
      </div>

      {/* Cómo medirse */}
      <div className="space-y-2 bg-[#f5f2ed] p-6 text-sm text-stone-600">
        <p className="mb-3 text-xs tracking-widest text-stone-500 uppercase">Cómo tomar tus medidas</p>
        <p>
          <span className="font-medium text-stone-900">Pecho —</span> Mide alrededor de la parte más ancha del
          pecho, con los brazos relajados a los lados.
        </p>
        <p>
          <span className="font-medium text-stone-900">Cintura —</span> Mide alrededor de la parte más
          estrecha de tu cintura, generalmente sobre el ombligo.
        </p>
        <p>
          <span className="font-medium text-stone-900">Cadera —</span> Mide alrededor de la parte más ancha de
          tus caderas.
        </p>
        <p>
          <span className="font-medium text-stone-900">Largo (pantalón) —</span> Mide desde la entrepierna
          hasta el tobillo.
        </p>
      </div>

      {/* Tabla ropa */}
      <div>
        <h2 className="mb-5 text-xs tracking-widest text-stone-500 uppercase">
          Ropa — Poleras, camisas, polos
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="py-3 pr-6 text-left text-xs font-normal tracking-widest text-stone-500 uppercase">
                  Talla
                </th>
                <th className="py-3 pr-6 text-left text-xs font-normal tracking-widest text-stone-500 uppercase">
                  Pecho
                </th>
                <th className="py-3 pr-6 text-left text-xs font-normal tracking-widest text-stone-500 uppercase">
                  Cintura
                </th>
                <th className="py-3 text-left text-xs font-normal tracking-widest text-stone-500 uppercase">
                  Cadera
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {ROPA.map((row) => (
                <tr key={row.talla} className="transition-colors hover:bg-stone-50">
                  <td className="py-3.5 pr-6 font-medium text-stone-900">{row.talla}</td>
                  <td className="py-3.5 pr-6 text-stone-600">{cm(row.pecho, unidad)}</td>
                  <td className="py-3.5 pr-6 text-stone-600">{cm(row.cintura, unidad)}</td>
                  <td className="py-3.5 text-stone-600">{cm(row.cadera, unidad)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla pantalones */}
      <div>
        <h2 className="mb-5 text-xs tracking-widest text-stone-500 uppercase">Pantalones</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="py-3 pr-6 text-left text-xs font-normal tracking-widest text-stone-500 uppercase">
                  Talla
                </th>
                <th className="py-3 pr-6 text-left text-xs font-normal tracking-widest text-stone-500 uppercase">
                  Cintura
                </th>
                <th className="py-3 pr-6 text-left text-xs font-normal tracking-widest text-stone-500 uppercase">
                  Cadera
                </th>
                <th className="py-3 text-left text-xs font-normal tracking-widest text-stone-500 uppercase">
                  Largo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {PANTALONES.map((row) => (
                <tr key={row.talla} className="transition-colors hover:bg-stone-50">
                  <td className="py-3.5 pr-6 font-medium text-stone-900">{row.talla}</td>
                  <td className="py-3.5 pr-6 text-stone-600">{cm(row.cintura, unidad)}</td>
                  <td className="py-3.5 pr-6 text-stone-600">{cm(row.cadera, unidad)}</td>
                  <td className="py-3.5 text-stone-600">{cm(row.largo, unidad)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t border-stone-100 pt-4">
        <p className="text-xs text-stone-500">
          ¿Tienes dudas sobre tu talla? Escríbenos a{' '}
          <a
            href="mailto:contacto@atelier.pe"
            className="underline underline-offset-4 transition-colors hover:text-stone-700"
          >
            contacto@atelier.pe
          </a>
        </p>
      </div>
    </div>
  )
}
