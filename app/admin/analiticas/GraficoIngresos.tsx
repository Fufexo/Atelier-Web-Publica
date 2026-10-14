'use client'

import { useState } from 'react'
import { diaCorto, type DiaVentas } from '@/lib/analiticas'
import { formatearPrecio } from '@/lib/format'

const ALTO = 160
const ANCHO_EJE = 56
const PASO = 22 // ancho de cada columna (barra + separación)
const BARRA = 14

/** Escala "bonita": 4 líneas guía con valores redondos. */
function escala(max: number): number[] {
  const bruto = max / 4
  const magnitud = 10 ** Math.floor(Math.log10(bruto || 1))
  const paso = [1, 2, 2.5, 5, 10].map((m) => m * magnitud).find((p) => p >= bruto) ?? bruto
  return [1, 2, 3, 4].map((i) => i * paso)
}

/**
 * Barras de ingresos por día. Una sola serie: el título la nombra, sin leyenda.
 * Colores con tokens `gray` para que el modo oscuro del panel los remapee.
 * Hover/foco muestra el detalle; la tabla debajo es la vista accesible.
 */
export default function GraficoIngresos({ dias }: { dias: DiaVentas[] }) {
  const [activo, setActivo] = useState<number | null>(null)
  const guias = escala(Math.max(...dias.map((d) => d.ingresos)))
  const tope = guias[guias.length - 1]
  const ancho = ANCHO_EJE + dias.length * PASO
  const y = (v: number) => ALTO - (v / tope) * ALTO
  const dia = activo !== null ? dias[activo] : null

  return (
    <figure>
      <div className="relative overflow-x-auto">
        <svg
          width={ancho}
          height={ALTO + 28}
          className="block text-xs"
          role="img"
          aria-label={`Ingresos por día. Máximo ${formatearPrecio(Math.max(...dias.map((d) => d.ingresos)))}.`}
        >
          {guias.map((v) => (
            <g key={v}>
              <line x1={ANCHO_EJE} x2={ancho} y1={y(v)} y2={y(v)} className="stroke-gray-100" />
              <text x={ANCHO_EJE - 8} y={y(v) + 4} textAnchor="end" className="fill-gray-500 tabular-nums">
                {v >= 1000 ? `${v / 1000}k` : v}
              </text>
            </g>
          ))}
          <line x1={ANCHO_EJE} x2={ancho} y1={ALTO} y2={ALTO} className="stroke-gray-300" />

          {dias.map((d, i) => {
            const x = ANCHO_EJE + i * PASO + (PASO - BARRA) / 2
            const alto = d.ingresos > 0 ? Math.max(ALTO - y(d.ingresos), 2) : 0
            const r = Math.min(4, alto) // radio de las esquinas superiores
            return (
              <g
                key={d.fecha}
                tabIndex={0}
                onMouseEnter={() => setActivo(i)}
                onMouseLeave={() => setActivo(null)}
                onFocus={() => setActivo(i)}
                onBlur={() => setActivo(null)}
                className="outline-none"
                aria-label={`${diaCorto(d.fecha)}: ${formatearPrecio(d.ingresos)}, ${d.pedidos} pedidos`}
              >
                {/* Zona de hover más grande que la barra. */}
                <rect
                  x={ANCHO_EJE + i * PASO}
                  y={0}
                  width={PASO}
                  height={ALTO}
                  className="fill-transparent"
                />
                {alto > 0 && (
                  <path
                    // Esquinas superiores redondeadas (4px), base recta sobre el eje.
                    d={`M${x},${ALTO} v${-(alto - r)} q0,${-r} ${r},${-r} h${BARRA - 2 * r} q${r},0 ${r},${r} v${alto - r} z`}
                    className={activo === i ? 'fill-gray-900' : 'fill-gray-700'}
                  />
                )}
                {i % 5 === 0 && (
                  <text x={x + BARRA / 2} y={ALTO + 18} textAnchor="middle" className="fill-gray-500">
                    {diaCorto(d.fecha)}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {dia && activo !== null && (
          <div
            role="status"
            className="pointer-events-none absolute top-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm"
            style={{ left: Math.min(ANCHO_EJE + activo * PASO + PASO, ancho - 140) }}
          >
            <p className="font-medium text-gray-900">{diaCorto(dia.fecha)}</p>
            <p className="text-gray-600 tabular-nums">{formatearPrecio(dia.ingresos)}</p>
            <p className="text-gray-500">
              {dia.pedidos} {dia.pedidos === 1 ? 'pedido' : 'pedidos'}
            </p>
          </div>
        )}
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-xs text-gray-500">Ver como tabla</summary>
        <table className="mt-2 w-full max-w-sm text-xs">
          <thead>
            <tr className="text-gray-500">
              <th scope="col" className="py-1 text-left">
                Día
              </th>
              <th scope="col" className="py-1 text-right">
                Pedidos
              </th>
              <th scope="col" className="py-1 text-right">
                Ingresos
              </th>
            </tr>
          </thead>
          <tbody>
            {dias.map((d) => (
              <tr key={d.fecha} className="text-gray-700">
                <td className="py-0.5">{diaCorto(d.fecha)}</td>
                <td className="py-0.5 text-right tabular-nums">{d.pedidos}</td>
                <td className="py-0.5 text-right tabular-nums">{formatearPrecio(d.ingresos)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}
