import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'

export const metadata = { title: 'Devoluciones — Atelier' }

const secciones = [
  {
    titulo: 'Plazo para devoluciones',
    contenido: 'Tienes hasta 7 días calendario desde la recepción de tu pedido para solicitar una devolución o cambio.',
  },
  {
    titulo: 'Condiciones',
    contenido: 'La prenda debe estar sin usar, con sus etiquetas originales y en el mismo estado en que fue recibida. No se aceptan devoluciones de prendas que hayan sido usadas, lavadas o alteradas.',
  },
  {
    titulo: 'Producto dañado en el envío',
    contenido: 'Si tu pedido llegó con daños visibles en el empaque o en la prenda, es muy importante que tomes fotos del paquete antes de abrirlo y también del producto dañado. Envíanos esas fotos a nuestro correo o WhatsApp dentro de las 24 horas de recibido. Con esa evidencia gestionamos el reclamo con la empresa de transporte y coordinamos el reenvío o reembolso.',
  },
  {
    titulo: 'Cómo iniciar una devolución',
    contenido: 'Escríbenos a nuestro correo o WhatsApp indicando tu número de pedido, el motivo de la devolución y adjunta fotos del producto. Te responderemos en un máximo de 48 horas con los pasos a seguir.',
  },
  {
    titulo: 'Reembolsos',
    contenido: 'Una vez recibida y aprobada la devolución, procesamos el reembolso dentro de 5 a 10 días hábiles a través del mismo medio de pago utilizado en la compra.',
  },
]

export default function DevolucionesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-white">
        <div className="max-w-2xl mx-auto px-8 py-16">

          <h1 className="text-3xl text-stone-900 mb-2" style={{ fontFamily: 'var(--font-noto-serif)' }}>
            Devoluciones
          </h1>
          <p className="text-sm text-stone-400 mb-12" style={{ fontFamily: 'var(--font-manrope)' }}>
            Tu satisfacción es lo más importante. Si algo no está bien, lo resolvemos.
          </p>

          <div className="space-y-10">
            {secciones.map((s) => (
              <div key={s.titulo}>
                <h2 className="text-xs uppercase tracking-widest text-stone-400 mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>
                  {s.titulo}
                </h2>
                <p className="text-sm text-stone-600 leading-relaxed" style={{ fontFamily: 'var(--font-manrope)' }}>
                  {s.contenido}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-stone-100">
            <p className="text-sm text-stone-500 mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>
              ¿Quieres iniciar una devolución?
            </p>
            <a
              href="mailto:contacto@atelier.pe"
              className="text-sm text-stone-900 underline underline-offset-4 hover:text-stone-500 transition-colors"
              style={{ fontFamily: 'var(--font-manrope)' }}
            >
              Escríbenos a contacto@atelier.pe
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
