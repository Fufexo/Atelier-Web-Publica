import { Link } from 'next-view-transitions'
import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'

interface Props {
  searchParams: Promise<{ numero?: string }>
}

export default async function ConfirmacionPage({ searchParams }: Props) {
  const { numero } = await searchParams

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-white flex flex-col items-center justify-center text-center px-8">
        <span className="material-symbols-outlined text-stone-200 text-8xl mb-6">check_circle</span>

        <h1 className="text-3xl text-stone-900 mb-3" style={{ fontFamily: 'var(--font-noto-serif)' }}>
          ¡Pedido confirmado!
        </h1>

        {numero && (
          <p className="text-sm text-stone-400 mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>
            Pedido <span className="text-stone-700 font-medium">#{String(numero).padStart(4, '0')}</span>
          </p>
        )}

        <p className="text-sm text-stone-400 mb-10 max-w-sm" style={{ fontFamily: 'var(--font-manrope)' }}>
          Tu pago fue procesado con éxito. Te contactaremos pronto para coordinar el envío.
        </p>

        <Link
          href="/tienda"
          className="bg-stone-900 text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-stone-700 transition-colors"
          style={{ fontFamily: 'var(--font-manrope)' }}
        >
          Seguir comprando
        </Link>
      </main>
      <Footer />
    </div>
  )
}
