import Icon, { type NombreIcono } from '@/components/ui/Icon'
import { CONTACTO } from '@/lib/site'

export const metadata = { title: 'Contacto', description: 'Escríbenos por WhatsApp, correo o Instagram.' }

const canales: { icon: NombreIcono; titulo: string; descripcion: string; accion: string; href: string }[] = [
  {
    icon: 'chat',
    titulo: 'WhatsApp',
    descripcion: 'Lunes a sábado, 9am – 7pm',
    accion: 'Escribir por WhatsApp',
    href: CONTACTO.whatsapp,
  },
  {
    icon: 'correo',
    titulo: 'Correo',
    descripcion: 'Te respondemos en menos de 24 horas',
    accion: CONTACTO.email,
    href: `mailto:${CONTACTO.email}`,
  },
  {
    icon: 'camara',
    titulo: 'Instagram',
    descripcion: 'Síguenos y escríbenos por DM',
    accion: '@atelier',
    href: CONTACTO.instagram,
  },
]

export default function ContactoPage() {
  return (
    <div className="flex-1 bg-white">
      <div className="mx-auto max-w-2xl px-6 py-16 md:px-8">
        <h1 className="mb-2 font-serif text-3xl text-stone-900">Contacto</h1>
        <p className="mb-12 text-sm text-stone-500">Estamos para ayudarte. Elige el canal que prefieras.</p>

        <div className="mb-16 space-y-4">
          {canales.map((canal) => (
            <a
              key={canal.titulo}
              href={canal.href}
              target={canal.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="group flex items-center gap-4 border border-stone-200 p-5 transition-colors hover:border-stone-400"
            >
              <Icon
                name={canal.icon}
                className="size-6 shrink-0 text-stone-300 transition-colors group-hover:text-stone-600"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-stone-900">{canal.titulo}</p>
                <p className="mt-0.5 text-xs text-stone-500">{canal.descripcion}</p>
                <p className="mt-1.5 text-xs text-stone-500 transition-colors group-hover:text-stone-900 min-[420px]:hidden">
                  {canal.accion}
                </p>
              </div>
              <span className="hidden shrink-0 text-sm text-stone-500 transition-colors group-hover:text-stone-900 min-[420px]:block">
                {canal.accion}
              </span>
            </a>
          ))}
        </div>

        <div className="border-t border-stone-100 pt-10">
          <h2 className="mb-5 text-xs tracking-widest text-stone-500 uppercase">Preguntas frecuentes</h2>
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
                <p className="mb-1 text-sm font-medium text-stone-900">{faq.q}</p>
                <p className="text-sm leading-relaxed text-stone-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
