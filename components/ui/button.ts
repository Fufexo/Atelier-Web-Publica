// Estilos de acción de la tienda. Es una función y no un componente para que el
// mismo estilo sirva en <button>, <Link> y <a> sin perder su semántica.
//
//   <Link href="/tienda" className={boton()}>Ver tienda</Link>
//   <button type="submit" className={boton({ variante: 'claro', ancho: 'completo' })}>…</button>

export type VarianteBoton = 'primario' | 'claro' | 'enlace'

const BASE =
  'inline-flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-colors duration-300 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900'

const VARIANTES: Record<VarianteBoton, string> = {
  primario: 'min-h-11 bg-stone-900 px-8 py-3 text-white hover:bg-stone-700 disabled:bg-stone-300',
  claro: 'min-h-11 bg-white px-8 py-3 font-semibold text-stone-900 hover:bg-stone-900 hover:text-white',
  enlace: 'border-b border-stone-400 pb-0.5 text-stone-500 hover:border-stone-900 hover:text-stone-900',
}

export function boton({
  variante = 'primario',
  ancho = 'auto',
  className = '',
}: { variante?: VarianteBoton; ancho?: 'auto' | 'completo'; className?: string } = {}) {
  return [BASE, VARIANTES[variante], ancho === 'completo' ? 'w-full' : '', className]
    .filter(Boolean)
    .join(' ')
}
