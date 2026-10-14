import Link from 'next/link'
import { NAV_AYUDA, NAV_TIENDA } from '@/lib/navigation'

const COLUMNAS = [
  { titulo: 'Tienda', enlaces: NAV_TIENDA },
  { titulo: 'Ayuda', enlaces: NAV_AYUDA },
]

export default function Footer() {
  return (
    <footer className="bg-tinta text-tinta-claro/80 w-full">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-10 md:grid-cols-3 md:gap-12 md:px-14 md:py-16">
        <div className="col-span-2 md:col-span-1">
          <p className="text-tinta-claro mb-2 font-serif text-xl font-semibold md:mb-4 md:text-2xl">
            ATELIER
          </p>
          <p className="text-tinta-suave max-w-xs text-xs leading-relaxed md:text-sm">
            Moda contemporánea con esencia atemporal. Calidad y diseño en cada prenda.
          </p>
        </div>

        {COLUMNAS.map(({ titulo, enlaces }) => (
          <nav key={titulo} aria-label={titulo}>
            <h2 className="text-tinta-apagado mb-3 text-[10px] tracking-widest uppercase md:mb-4 md:text-xs">
              {titulo}
            </h2>
            <ul className="space-y-2.5 md:space-y-2">
              {enlaces.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-tinta-claro text-sm transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-tinta-borde mx-auto max-w-7xl border-t px-6 py-6 text-center md:px-14 md:py-8">
        <p className="text-tinta-apagado text-xs">
          © {new Date().getFullYear()} ATELIER. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
