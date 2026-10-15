import 'server-only'
import { SITE_URL } from './site'

/** Tamaño que esperan Facebook, WhatsApp, LinkedIn y X (1.91:1). */
export const OG_TAMANO = { width: 1200, height: 630 }

// Paleta de la tienda (ver globals.css).
const CREMA = '#fcf9f4'
const TINTA = '#1c1917'
const GRIS = '#57534e'
const ARENA = '#e7e0d4'

/**
 * Descarga de Google Fonts solo los caracteres que usa la imagen. Sin User-Agent de
 * navegador, Google devuelve TTF, el formato que entiende `ImageResponse`. Si falla
 * (sin red durante el build), la imagen se genera igual con la fuente por defecto.
 */
async function fuenteGoogle(familia: string, peso: number, texto: string): Promise<ArrayBuffer | null> {
  try {
    const params = `family=${familia.replace(/ /g, '+')}:wght@${peso}&text=${encodeURIComponent(texto)}`
    const css = await (await fetch(`https://fonts.googleapis.com/css2?${params}`)).text()
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1]
    return url ? await (await fetch(url)).arrayBuffer() : null
  } catch {
    return null
  }
}

// Siempre incluidos: `textTransform: uppercase` y los precios usan caracteres que no
// aparecen tal cual en el texto.
const CARACTERES_BASE =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚÑÜabcdefghijklmnopqrstuvwxyzáéíóúñü0123456789 .,:;/-·→()'

export async function fuentesOg(texto: string) {
  const caracteres = [...new Set(texto + CARACTERES_BASE)].join('')
  const [titulo, cuerpo] = await Promise.all([
    fuenteGoogle('Playfair Display', 600, caracteres),
    fuenteGoogle('Inter', 500, caracteres),
  ])
  return [
    ...(titulo ? [{ name: 'Playfair', data: titulo, weight: 600 as const }] : []),
    ...(cuerpo ? [{ name: 'Inter', data: cuerpo, weight: 500 as const }] : []),
  ]
}

interface TarjetaProps {
  antetitulo: string
  titulo: string
  /** Línea bajo el titular (descripción o precio). */
  detalle: React.ReactNode
  cta: string
  /** Foto para la mitad derecha (URL o data URI, JPG/PNG). */
  imagen: string | null
}

/** Tarjeta para compartir: marca, titular, detalle y llamada a la acción, con foto al lado. */
export function TarjetaOg({ antetitulo, titulo, detalle, cta, imagen }: TarjetaProps) {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', background: CREMA, fontFamily: 'Inter' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: 640,
          padding: '60px 56px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{ display: 'flex', fontFamily: 'Playfair', fontSize: 32, letterSpacing: 8, color: TINTA }}
          >
            ATELIER
          </div>
          <div style={{ display: 'flex', fontSize: 18, color: GRIS }}>{new URL(SITE_URL).host}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 18,
              letterSpacing: 4,
              color: GRIS,
              textTransform: 'uppercase',
            }}
          >
            {antetitulo}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 18,
              fontFamily: 'Playfair',
              fontSize: titulo.length > 30 ? 50 : 62,
              lineHeight: 1.08,
              color: TINTA,
            }}
          >
            {titulo}
          </div>
          <div style={{ display: 'flex', marginTop: 22, fontSize: 24, color: GRIS }}>{detalle}</div>
        </div>

        <div style={{ display: 'flex' }}>
          <div
            style={{
              display: 'flex',
              background: TINTA,
              color: CREMA,
              padding: '20px 34px',
              fontSize: 21,
              letterSpacing: 3,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {cta} →
          </div>
        </div>
      </div>

      {imagen ? (
        // eslint-disable-next-line @next/next/no-img-element -- ImageResponse solo admite <img>
        <img src={imagen} alt="" width={560} height={630} style={{ objectFit: 'cover' }} />
      ) : (
        <div style={{ display: 'flex', width: 560, height: 630, background: ARENA }} />
      )}
    </div>
  )
}

/** ImageResponse (satori) no decodifica WebP ni AVIF: esas fotos se omiten. */
export function fotoCompatible(url: string | undefined): string | null {
  return url && /\.(jpe?g|png)$/i.test(url) ? url : null
}
