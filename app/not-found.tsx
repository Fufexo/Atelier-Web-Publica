import Link from 'next/link'
import Footer from '@/components/store/Footer'
import Navbar from '@/components/store/Navbar'
import EmptyState from '@/components/ui/EmptyState'
import { boton } from '@/components/ui/button'

// 404 de URLs que no coinciden con ninguna ruta: viven fuera del layout de la
// tienda, así que se agregan Navbar y Footer a mano.
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex flex-1 bg-white">
        <EmptyState
          titulo="No encontramos esta página"
          descripcion="Puede que el enlace tenga un error o que la página ya no exista."
        >
          <Link href="/tienda" className={boton()}>
            Ver la tienda
          </Link>
        </EmptyState>
      </main>
      <Footer />
    </div>
  )
}
