import type { Metadata } from 'next'
import PaginaInfo from '@/components/store/PaginaInfo'
import { COSTO_ENVIO_PROVINCIA, DISTRITOS_LIMA } from '@/lib/envios'
import { formatearPrecio } from '@/lib/format'

// Las tarifas salen de lib/envios.ts, la misma fuente que usa el checkout.
const precios = DISTRITOS_LIMA.map((d) => d.precio)
const desde = formatearPrecio(Math.min(...precios))
const hasta = formatearPrecio(Math.max(...precios))

export const metadata: Metadata = {
  title: 'Envíos',
  description: 'Todo lo que necesitas saber sobre el envío de tu pedido.',
}

const secciones = [
  {
    titulo: 'Cobertura',
    contenido: 'Enviamos a todos los distritos de Lima Metropolitana y a provincias de todo el Perú.',
  },
  {
    titulo: 'Tiempo de entrega',
    contenido:
      'El tiempo de entrega es de 1 a 7 días hábiles dependiendo de tu ubicación, contados desde la confirmación del pago. Para zonas céntricas de Lima el tiempo suele ser de 1 a 2 días.',
  },
  {
    titulo: 'Costo de envío',
    contenido: `El costo depende de tu distrito y lo ves en el checkout antes de pagar: entre ${desde} y ${hasta} en Lima Metropolitana y ${formatearPrecio(COSTO_ENVIO_PROVINCIA)} para provincias. Trabajamos con Olva Courier y servicios de delivery para garantizar la seguridad de tu paquete.`,
  },
  {
    titulo: 'Seguimiento',
    contenido:
      'Una vez despachado tu pedido, te enviaremos el número de seguimiento para que puedas rastrear tu paquete en tiempo real a través de la página de Olva Courier.',
  },
  {
    titulo: '¿Tu pedido llegó con problemas?',
    contenido:
      'Si tu paquete llegó dañado o con signos de manipulación, tómale fotos antes de abrirlo y escríbenos de inmediato. Gestionamos el reclamo con la empresa de transporte por ti.',
  },
]

export default function EnviosPage() {
  return (
    <PaginaInfo
      titulo="Envíos"
      descripcion="Todo lo que necesitas saber sobre el envío de tu pedido."
      secciones={secciones}
      consulta="¿Tienes alguna consulta sobre tu envío?"
    />
  )
}
