import { formatearPrecio } from '@/lib/format'
import type { Totales } from '@/lib/precios'

interface Props {
  totales: Totales
  /** `null` cuando aún no se eligió destino. */
  envio: number | null
  textoSinEnvio?: string
}

/** Desglose subtotal / IGV / envío / total. Compartido por carrito y checkout. */
export default function ResumenTotales({ totales, envio, textoSinEnvio = 'Se calcula al pagar' }: Props) {
  return (
    <dl className="space-y-3 text-sm">
      <Fila etiqueta="Subtotal (sin IGV)" valor={formatearPrecio(totales.subtotal)} />
      <Fila etiqueta="IGV (18%)" valor={formatearPrecio(totales.igv)} />
      <Fila
        etiqueta="Envío"
        valor={
          envio === null ? (
            <span className="text-xs text-stone-600">{textoSinEnvio}</span>
          ) : (
            formatearPrecio(envio)
          )
        }
      />
      <div className="mt-1 flex justify-between border-t border-stone-200 pt-4 font-medium text-stone-900">
        <dt>Total</dt>
        <dd className="text-lg">{formatearPrecio(totales.total)}</dd>
      </div>
    </dl>
  )
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <dt className="text-stone-600">{etiqueta}</dt>
      <dd className="text-stone-900">{valor}</dd>
    </div>
  )
}
