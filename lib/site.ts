/** URL pública del sitio, para metadata, sitemap y enlaces en emails. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

export const MARCA = 'ATELIER'

/**
 * Campos de Open Graph comunes. Una página que define su propio `openGraph` reemplaza
 * el del layout entero, así que debe incluirlos (la imagen la ponen los opengraph-image.tsx).
 */
export const OPEN_GRAPH_BASE = { siteName: MARCA, locale: 'es_PE', type: 'website' } as const

export const CONTACTO = {
  email: 'contacto@atelier.pe',
  whatsapp: 'https://wa.me/51999999999',
  instagram: 'https://instagram.com/atelier',
} as const
