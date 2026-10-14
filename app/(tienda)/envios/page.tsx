import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'

export const metadata = { title: 'Envíos — Atelier' }

const secciones = [
  {
    titulo: 'Cobertura',
    contenido: 'Realizamos envíos a todo Lima Metropolitana. Si tienes dudas sobre si llegamos a tu distrito, escríbenos antes de realizar tu pedido.',
  },
  {
    titulo: 'Tiempo de entrega',
    contenido: 'El tiempo de entrega es de 1 a 7 días hábiles dependiendo de tu ubicación, contados desde la confirmación del pago. Para zonas céntricas de Lima el tiempo suele ser de 1 a 2 días.',
  },
  {
    titulo: 'Costo de envío',
    contenido: 'El costo varía según la distancia y será coordinado contigo por WhatsApp o correo electrónico después de confirmar tu pedido. Trabajamos con Olva Courier y servicios de delivery para garantizar la seguridad de tu paquete.',
  },
  {
    titulo: 'Seguimiento',
    contenido: 'Una vez despachado tu pedido, te enviaremos el número de seguimiento para que puedas rastrear tu paquete en tiempo real a través de la página de Olva Courier.',
  },
  {
    titulo: '¿Tu pedido llegó con problemas?',
    contenido: 'Si tu paquete llegó dañado o con signos de manipulación, tómale fotos antes de abrirlo y escríbenos de inmediato. Gestionamos el reclamo con la empresa de transporte por ti.',
  },
]

export default function EnviosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-white">
        <div className="max-w-2xl mx-auto px-8 py-16">

          <h1 className="text-3xl text-stone-900 mb-2" style={{ fontFamily: 'var(--font-noto-serif)' }}>
            Envíos
          </h1>
          <p className="text-sm text-stone-400 mb-12" style={{ fontFamily: 'var(--font-manrope)' }}>
            Todo lo que necesitas saber sobre el envío de tu pedido.
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
              ¿Tienes alguna consulta sobre tu envío?
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
