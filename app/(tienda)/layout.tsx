import { ViewTransition } from 'react'
import Footer from '@/components/store/Footer'
import Navbar from '@/components/store/Navbar'

export default function TiendaLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="sr-only z-100 bg-stone-900 px-4 py-2 text-sm text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido" className="flex flex-1 flex-col">
        {/* Las navegaciones de Next son transiciones: React anima el cambio de página. */}
        <ViewTransition>{children}</ViewTransition>
      </main>
      <Footer />
    </div>
  )
}
