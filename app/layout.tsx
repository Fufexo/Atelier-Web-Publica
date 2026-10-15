import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { OPEN_GRAPH_BASE, SITE_URL } from '@/lib/site'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  style: ['normal', 'italic'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ATELIER — Moda contemporánea y ropa online en Perú',
    template: '%s | ATELIER — Moda online en Perú',
  },
  description: 'Tienda de ropa online en Perú. Moda para mujer, hombre y unisex con envíos a todo el país.',
  openGraph: OPEN_GRAPH_BASE,
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = {
  themeColor: '#fcf9f4',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es-PE" className={`${playfair.variable} ${inter.variable} scroll-smooth`}>
      <body>{children}</body>
    </html>
  )
}
