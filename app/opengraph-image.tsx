import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { fuentesOg, OG_TAMANO, TarjetaOg } from '@/lib/og'

// Imagen para compartir la tienda (y fallback de las páginas sin imagen propia).
// Se genera una vez en el build.

export const alt = 'ATELIER — Moda contemporánea con envíos a todo el Perú'
export const size = OG_TAMANO
export const contentType = 'image/png'

const TEXTO = {
  antetitulo: 'Nueva colección',
  titulo: 'Moda contemporánea con esencia atemporal',
  detalle: 'Mujer y hombre · Envíos a todo el Perú',
  cta: 'Compra online',
}

export default async function Image() {
  const hero = await readFile(join(process.cwd(), 'public/hero-fashion.jpg'))
  const fuentes = await fuentesOg(Object.values(TEXTO).join(' '))

  return new ImageResponse(
    <TarjetaOg {...TEXTO} imagen={`data:image/jpeg;base64,${hero.toString('base64')}`} />,
    { ...size, fonts: fuentes }
  )
}
