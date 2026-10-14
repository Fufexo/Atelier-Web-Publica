import Link from 'next/link'
import { AdminHeader, Alerta, botonAdmin, Card } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/auth'
import { calcularStockTotal, STOCK_BAJO } from '@/lib/pedidos'
import { parsearImagenes } from '@/lib/types'
import TablaProductos from './TablaProductos'

export const metadata = { title: 'Productos' }

export default async function ProductosPage() {
  const { supabase } = await requireAdmin()
  const { data, error } = await supabase
    .from('productos')
    .select(
      'id, nombre, sku, precio, precio_oferta, activo, destacado, imagenes, categorias(nombre), variantes(stock)'
    )
    .order('orden')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)

  const productos = data.map((p) => ({
    ...p,
    imagen: parsearImagenes(p.imagenes)[0]?.url ?? null,
    categoria: p.categorias?.nombre ?? null,
    stock: calcularStockTotal(p.variantes),
  }))
  const alertas = productos.filter((p) => p.activo && p.stock <= STOCK_BAJO)

  return (
    <div className="p-8">
      {alertas.length > 0 && (
        <div className="mb-6">
          <Alerta tono="aviso">
            <strong>
              {alertas.length} {alertas.length === 1 ? 'producto activo' : 'productos activos'} con stock bajo
              o agotado:
            </strong>{' '}
            {alertas.map((p) => p.nombre).join(', ')}
          </Alerta>
        </div>
      )}

      <AdminHeader
        titulo={
          <>
            Productos
            {productos.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">{productos.length} en total</span>
            )}
          </>
        }
      >
        <Link href="/admin/productos/nuevo" className={botonAdmin}>
          + Nuevo producto
        </Link>
      </AdminHeader>

      {productos.length === 0 ? (
        <Card className="px-6 py-16 text-center">
          <p className="mb-4 text-sm text-gray-500">Aún no tienes productos.</p>
          <Link href="/admin/productos/nuevo" className="text-sm font-medium text-slate-700 underline">
            Crear el primero
          </Link>
        </Card>
      ) : (
        <TablaProductos productos={productos} />
      )}
    </div>
  )
}
