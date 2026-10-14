/** URL pública del sitio, para metadata, sitemap y enlaces en emails. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

export const MARCA = 'ATELIER'

export const CONTACTO = {
  email: 'contacto@atelier.pe',
  whatsapp: 'https://wa.me/51999999999',
  instagram: 'https://instagram.com/atelier',
} as const
