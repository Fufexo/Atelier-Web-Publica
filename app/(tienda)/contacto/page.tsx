import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'

export const metadata = { title: 'Contacto — Atelier' }

const canales = [
  {
    icon: 'chat',
    titulo: 'WhatsApp',
    descripcion: 'Lunes a sábado, 9am – 7pm',
    accion: 'Escribir por WhatsApp',
    href: 'https://wa.me/51999999999',
  },
  {
    icon: 'mail',
    titulo: 'Correo',
    descripcion: 'Te respondemos en menos de 24 horas',
    accion: 'contacto@atelier.pe',
    href: 'mailto:contacto@atelier.pe',
  },
  {
    icon: 'photo_camera',
    titulo: 'Instagram',
    descripcion: 'Síguenos y escríbenos por DM',
    accion: '@atelier',
    href: 'https://instagram.com/atelier',
  },
]

export default function ContactoPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-white">
        <div className="max-w-2xl mx-auto px-8 py-16">

          <h1 className="text-3xl text-stone-900 mb-2" style={{ fontFamily: 'var(--font-noto-serif)' }}>
            Contacto
          </h1>
          <p className="text-sm text-stone-400 mb-12" style={{ fontFamily: 'var(--font-manrope)' }}>
            Estamos para ayudarte. Elige el canal que prefieras.
          </p>

          <div className="space-y-4 mb-16">
            {canales.map((canal) => (
              <a
                key={canal.titulo}
                href={canal.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 border border-stone-200 hover:border-stone-400 transition-colors group"
              >
                <span className="material-symbols-outlined text-stone-300 group-hover:text-stone-600 transition-colors text-2xl shrink-0">
                  {canal.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900" style={{ fontFamily: 'var(--font-manrope)' }}>
                    {canal.titulo}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5" style={{ fontFamily: 'var(--font-manrope)' }}>
                    {canal.descripcion}
                  </p>
                  <p className="text-xs text-stone-500 group-hover:text-stone-900 transition-colors mt-1.5 min-[420px]:hidden" style={{ fontFamily: 'var(--font-manrope)' }}>
                    {canal.accion}
                  </p>
                </div>
                <span className="hidden min-[420px]:block text-sm text-stone-500 group-hover:text-stone-900 transition-colors shrink-0" style={{ fontFamily: 'var(--font-manrope)' }}>
                  {canal.accion}
                </span>
              </a>
            ))}
          </div>

          <div className="border-t border-stone-100 pt-10">
            <h2 className="text-xs uppercase tracking-widest text-stone-400 mb-5" style={{ fontFamily: 'var(--font-manrope)' }}>
              Preguntas frecuentes
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: '¿Cuánto demora mi pedido?',
                  a: 'Entre 1 y 7 días hábiles dependiendo de tu distrito. Consulta nuestra página de envíos para más detalles.',
                },
                {
                  q: '¿Puedo cambiar o devolver un producto?',
                  a: 'Sí, tienes 7 días desde la recepción. Revisa nuestra política de devoluciones.',
                },
                {
                  q: '¿Cómo sé qué talla elegir?',
                  a: 'Consulta nuestra guía de tallas o escríbenos y te ayudamos a elegir.',
                },
              ].map((faq) => (
                <div key={faq.q}>
                  <p className="text-sm font-medium text-stone-900 mb-1" style={{ fontFamily: 'var(--font-manrope)' }}>
                    {faq.q}
                  </p>
                  <p className="text-sm text-stone-500 leading-relaxed" style={{ fontFamily: 'var(--font-manrope)' }}>
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
