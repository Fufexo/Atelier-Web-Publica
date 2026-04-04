import { Link } from 'next-view-transitions'

export default function Footer() {
  return (
    <footer className="w-full bg-[#25211f] text-[#efe8dc]/80">
      <div className="max-w-7xl mx-auto px-6 py-10 md:px-14 md:py-16">

        {/* ── Mobile layout ── */}
        <div className="md:hidden space-y-8">
          {/* Marca */}
          <div>
            <h3 className="text-xl font-semibold text-[#efe8dc] mb-2" style={{ fontFamily: 'var(--font-noto-serif)' }}>
              ATELIER
            </h3>
            <p className="text-xs leading-relaxed text-[#d4c7b5]" style={{ fontFamily: 'var(--font-manrope)' }}>
              Moda contemporánea con esencia atemporal.
            </p>
          </div>

          {/* Links en 2 columnas */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-[#9b9083] mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>
                Tienda
              </h4>
              <ul className="space-y-2.5" style={{ fontFamily: 'var(--font-manrope)' }}>
                {[
                  { label: 'Mujer', href: '/tienda?genero=mujer' },
                  { label: 'Hombre', href: '/tienda?genero=hombre' },
                  { label: 'Novedades', href: '/tienda?novedad=true' },
                  { label: 'Ofertas', href: '/tienda?oferta=true' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm text-[#efe8dc]">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-[#9b9083] mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>
                Ayuda
              </h4>
              <ul className="space-y-2.5" style={{ fontFamily: 'var(--font-manrope)' }}>
                {[
                  { label: 'Envíos', href: '/envios' },
                  { label: 'Devoluciones', href: '/devoluciones' },
                  { label: 'Guía de tallas', href: '/guia-de-tallas' },
                  { label: 'Contacto', href: '/contacto' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm text-[#efe8dc]">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* ── Desktop layout (sin cambios) ── */}
        <div className="hidden md:grid grid-cols-3 gap-12">
          <div>
            <h3 className="text-2xl font-semibold text-[#efe8dc] mb-4" style={{ fontFamily: 'var(--font-noto-serif)' }}>
              ATELIER
            </h3>
            <p className="text-sm leading-relaxed text-[#d4c7b5] max-w-xs" style={{ fontFamily: 'var(--font-manrope)' }}>
              Moda contemporánea con esencia atemporal. Calidad y diseño en cada prenda.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#9b9083] mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>
              Tienda
            </h4>
            <ul className="space-y-2" style={{ fontFamily: 'var(--font-manrope)' }}>
              {[
                { label: 'Mujer', href: '/tienda?genero=mujer' },
                { label: 'Hombre', href: '/tienda?genero=hombre' },
                { label: 'Novedades', href: '/tienda?novedad=true' },
                { label: 'Ofertas', href: '/tienda?oferta=true' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-[#efe8dc] hover:text-white transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#9b9083] mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>
              Ayuda
            </h4>
            <ul className="space-y-2" style={{ fontFamily: 'var(--font-manrope)' }}>
              {[
                { label: 'Envíos', href: '/envios' },
                { label: 'Devoluciones', href: '/devoluciones' },
                { label: 'Guía de tallas', href: '/guia-de-tallas' },
                { label: 'Contacto', href: '/contacto' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-[#efe8dc] hover:text-white transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-10 md:mt-12 pt-6 md:pt-8 border-t border-[#3f3934] text-center">
          <p className="text-xs text-[#9b9083]" style={{ fontFamily: 'var(--font-manrope)' }}>
            © {new Date().getFullYear()} ATELIER. Todos los derechos reservados.
          </p>
        </div>

      </div>
    </footer>
  )
}
