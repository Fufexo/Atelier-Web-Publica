import type { Metadata } from 'next'
import CarritoView from './CarritoView'

export const metadata: Metadata = { title: 'Carrito', robots: { index: false } }

export default function CarritoPage() {
  return <CarritoView />
}
