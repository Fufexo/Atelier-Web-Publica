import type { MetadataRoute } from 'next'
import { getSlugsProductos } from '@/lib/catalogo'
import { NAV_AYUDA } from '@/lib/navigation'
import { SITE_URL } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productos = await getSlugsProductos()
  const estaticas = ['/', '/tienda', ...NAV_AYUDA.map((l) => l.href)]
  return [
    ...estaticas.map((ruta) => ({ url: `${SITE_URL}${ruta === '/' ? '' : ruta}` })),
    ...productos.map((p) => ({ url: `${SITE_URL}/producto/${p.slug}`, lastModified: p.updated_at })),
  ]
}
