import GuiaTallas from './GuiaTallas'

export const metadata = { title: 'Guía de tallas' }

export default function GuiaDeTallasPage() {
  return (
    <div className="flex-1 bg-white">
      <div className="mx-auto max-w-4xl px-6 py-16 md:px-8">
        <h1 className="mb-2 font-serif text-3xl text-stone-900">Guía de tallas</h1>
        <p className="mb-12 text-sm text-stone-500">
          Encuentra tu talla perfecta. Las medidas son referenciales — si estás entre dos tallas, te
          recomendamos elegir la mayor.
        </p>
        <GuiaTallas />
      </div>
    </div>
  )
}
