import { ImageResponse } from 'next/og'
import { getProductoPorSlug } from '@/lib/catalogo'
import { formatearPrecio } from '@/lib/format'
import { fotoCompatible, fuentesOg, OG_TAMANO, TarjetaOg } from '@/lib/og'
import { precioFinal } from '@/lib/precios'

// Imagen para compartir un producto: foto, nombre, precio y llamada a la acción.

export const alt = 'Producto de ATELIER'
export const size = OG_TAMANO
export const contentType = 'image/png'

export default async function Image({ params }: PageProps<'/producto/[slug]'>) {
  const { slug } = await params
  const prod = await getProductoPorSlug(slug)

  const titulo = prod?.nombre ?? 'Moda contemporánea'
  const precio = prod ? formatearPrecio(precioFinal(prod)) : ''
  const antes = prod?.precio_oferta ? formatearPrecio(prod.precio) : null
  const antetitulo = prod?.categoria?.nombre ?? 'ATELIER'
  const cta = 'Ver en la tienda'
  const fuentes = await fuentesOg([titulo, precio, antes, antetitulo, cta].join(' '))

  return new ImageResponse(
    <TarjetaOg
      antetitulo={antetitulo}
      titulo={titulo}
      detalle={
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontSize: 34, color: '#1c1917' }}>{precio}</span>
          {antes && <span style={{ marginLeft: 16, textDecoration: 'line-through' }}>{antes}</span>}
        </div>
      }
      cta={cta}
      imagen={fotoCompatible(prod?.imagenes[0]?.url)}
    />,
    { ...size, fonts: fuentes }
  )
}
