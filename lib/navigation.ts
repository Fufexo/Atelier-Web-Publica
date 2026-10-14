export interface EnlaceNav {
  href: string
  label: string
}

/** Barra superior y menú móvil. */
export const NAV_PRINCIPAL: EnlaceNav[] = [
  { href: '/tienda?genero=mujer', label: 'Mujer' },
  { href: '/tienda?genero=hombre', label: 'Hombre' },
  { href: '/tienda?novedad=true', label: 'Novedades' },
  { href: '/tienda', label: 'Colecciones' },
  { href: '/nosotros', label: 'Nosotros' },
]

export const NAV_TIENDA: EnlaceNav[] = [
  { href: '/tienda?genero=mujer', label: 'Mujer' },
  { href: '/tienda?genero=hombre', label: 'Hombre' },
  { href: '/tienda?novedad=true', label: 'Novedades' },
  { href: '/tienda?oferta=true', label: 'Ofertas' },
]

export const NAV_AYUDA: EnlaceNav[] = [
  { href: '/envios', label: 'Envíos' },
  { href: '/devoluciones', label: 'Devoluciones' },
  { href: '/guia-de-tallas', label: 'Guía de tallas' },
  { href: '/contacto', label: 'Contacto' },
  { href: '/nosotros', label: 'Nosotros' },
]

/**
 * Un enlace está activo si coincide la ruta y todos sus parámetros. `/tienda` a secas
 * solo está activo cuando no hay otro filtro de colección aplicado.
 */
export function estaActivo(href: string, pathname: string, params: URLSearchParams): boolean {
  const url = new URL(href, 'http://x')
  if (url.pathname !== pathname) return false
  if (url.search === '') {
    return !['genero', 'novedad', 'oferta'].some((k) => params.has(k))
  }
  return [...url.searchParams].every(([k, v]) => params.get(k) === v)
}
