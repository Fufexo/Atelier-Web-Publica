import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import GuiaTallas from './GuiaTallas'

export const metadata = { title: 'Guía de tallas — Atelier' }

export default function GuiaDeTallasPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-white">
        <div className="max-w-4xl mx-auto px-8 py-16">
          <h1 className="text-3xl text-stone-900 mb-2" style={{ fontFamily: 'var(--font-noto-serif)' }}>
            Guía de tallas
          </h1>
          <p className="text-sm text-stone-400 mb-12" style={{ fontFamily: 'var(--font-manrope)' }}>
            Encuentra tu talla perfecta. Las medidas son referenciales — si estás entre dos tallas, te recomendamos elegir la mayor.
          </p>
          <GuiaTallas />
        </div>
      </main>
      <Footer />
    </div>
  )
}
