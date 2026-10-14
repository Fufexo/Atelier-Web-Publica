import type { Metadata } from 'next'
import PaginaInfo from '@/components/store/PaginaInfo'

export const metadata: Metadata = {
  title: 'Devoluciones',
  description: 'Tu satisfacción es lo más importante. Si algo no está bien, lo resolvemos.',
}

const secciones = [
  {
    titulo: 'Plazo para devoluciones',
    contenido:
      'Tienes hasta 7 días calendario desde la recepción de tu pedido para solicitar una devolución o cambio.',
  },
  {
    titulo: 'Condiciones',
    contenido:
      'La prenda debe estar sin usar, con sus etiquetas originales y en el mismo estado en que fue recibida. No se aceptan devoluciones de prendas que hayan sido usadas, lavadas o alteradas.',
  },
  {
    titulo: 'Producto dañado en el envío',
    contenido:
      'Si tu pedido llegó con daños visibles en el empaque o en la prenda, es muy importante que tomes fotos del paquete antes de abrirlo y también del producto dañado. Envíanos esas fotos a nuestro correo o WhatsApp dentro de las 24 horas de recibido. Con esa evidencia gestionamos el reclamo con la empresa de transporte y coordinamos el reenvío o reembolso.',
  },
  {
    titulo: 'Cómo iniciar una devolución',
    contenido:
      'Escríbenos a nuestro correo o WhatsApp indicando tu número de pedido, el motivo de la devolución y adjunta fotos del producto. Te responderemos en un máximo de 48 horas con los pasos a seguir.',
  },
  {
    titulo: 'Reembolsos',
    contenido:
      'Una vez recibida y aprobada la devolución, procesamos el reembolso dentro de 5 a 10 días hábiles a través del mismo medio de pago utilizado en la compra.',
  },
]

export default function DevolucionesPage() {
  return (
    <PaginaInfo
      titulo="Devoluciones"
      descripcion="Tu satisfacción es lo más importante. Si algo no está bien, lo resolvemos."
      secciones={secciones}
      consulta="¿Necesitas iniciar una devolución?"
    />
  )
}
