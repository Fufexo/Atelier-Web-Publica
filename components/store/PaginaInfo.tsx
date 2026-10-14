import PageHeader from '@/components/ui/PageHeader'
import { CONTACTO } from '@/lib/site'

interface Props {
  titulo: string
  descripcion: string
  secciones: { titulo: string; contenido: string }[]
  /** Pregunta del bloque final de contacto. */
  consulta: string
}

/** Página de texto de ayuda (envíos, devoluciones…): secciones con título y cierre de contacto. */
export default function PaginaInfo({ titulo, descripcion, secciones, consulta }: Props) {
  return (
    <div className="flex-1 bg-white">
      <article className="mx-auto max-w-2xl px-6 py-16 md:px-8">
        <PageHeader titulo={titulo} descripcion={descripcion} className="mb-12" />

        <div className="space-y-10">
          {secciones.map((s) => (
            <section key={s.titulo}>
              <h2 className="mb-3 text-xs tracking-widest text-stone-500 uppercase">{s.titulo}</h2>
              <p className="text-sm leading-relaxed text-stone-600">{s.contenido}</p>
            </section>
          ))}
        </div>

        <div className="mt-16 border-t border-stone-100 pt-8">
          <p className="mb-2 text-sm text-stone-500">{consulta}</p>
          <a
            href={`mailto:${CONTACTO.email}`}
            className="text-sm text-stone-900 underline underline-offset-4 transition-colors hover:text-stone-500"
          >
            Escríbenos a {CONTACTO.email}
          </a>
        </div>
      </article>
    </div>
  )
}
