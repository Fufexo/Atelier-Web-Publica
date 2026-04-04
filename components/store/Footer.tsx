import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-[#25211f] text-[#efe8dc]/80">
      <div className="max-w-7xl mx-auto px-8 py-12 md:px-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
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
            <ul className="space-y-2 text-base" style={{ fontFamily: 'var(--font-manrope)' }}>
              {['Mujer', 'Hombre', 'Novedades', 'Ofertas'].map((item) => (
                <li key={item}>
                  <Link href="/tienda" className="text-[#efe8dc] hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#9b9083] mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>
              Ayuda
            </h4>
            <ul className="space-y-2 text-base" style={{ fontFamily: 'var(--font-manrope)' }}>
              {['Envíos', 'Devoluciones', 'Guía de tallas', 'Contacto'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-[#efe8dc] hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#9b9083] mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>
              Newsletter
            </h4>
            <p className="text-sm mb-4 text-[#d4c7b5]" style={{ fontFamily: 'var(--font-manrope)' }}>
              Sé el primero en conocer nuestras novedades.
            </p>
            <form className="flex" action="#">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 bg-transparent border border-[#4b453f] px-4 py-2.5 text-sm text-[#efe8dc] placeholder:text-[#867b6f] focus:outline-none focus:border-[#7f756a]"
                style={{ fontFamily: 'var(--font-manrope)' }}
              />
              <button
                type="submit"
                className="bg-[#efe8dc] text-[#25211f] px-4 py-2.5 text-xs uppercase tracking-widest hover:bg-white transition-colors"
                style={{ fontFamily: 'var(--font-manrope)' }}
              >
                OK
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#3f3934] text-center">
          <p className="text-xs text-[#9b9083]" style={{ fontFamily: 'var(--font-manrope)' }}>
            © {new Date().getFullYear()} ATELIER. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
