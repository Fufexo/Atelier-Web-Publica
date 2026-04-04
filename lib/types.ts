export type EstadoPedido =
  | 'pendiente'
  | 'pagado'
  | 'preparando'
  | 'enviado'
  | 'entregado'
  | 'cancelado'
  | 'reembolsado'

export type EstadoPago = 'pendiente' | 'completado' | 'fallido' | 'reembolsado'
export type MetodoPago = 'tarjeta' | 'yape' | 'plin' | 'cuotas'

export interface Categoria {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
  imagen_url: string | null
  activa: boolean
  orden: number
  created_at: string
}

export interface ImagenProducto {
  url: string
  alt: string
  orden: number
}

export interface Producto {
  id: string
  categoria_id: string | null
  nombre: string
  slug: string
  descripcion: string | null
  precio: number
  precio_oferta: number | null
  sku: string | null
  imagenes: ImagenProducto[]
  activo: boolean
  destacado: boolean
  genero: 'hombre' | 'mujer' | 'unisex'
  created_at: string
  updated_at: string
  categorias?: Categoria | null
  variantes?: Variante[]
}

export interface Variante {
  id: string
  producto_id: string
  talla: string | null
  color: string | null
  stock: number
  sku_variante: string | null
  activa: boolean
}

export interface DireccionEnvio {
  nombre_destinatario: string
  telefono: string
  departamento: string
  provincia: string
  distrito: string
  direccion: string
  referencia?: string
}

export interface ItemPedido {
  id: string
  pedido_id: string
  producto_id: string | null
  variante_id: string | null
  nombre_producto: string
  talla: string | null
  color: string | null
  precio_unitario: number
  cantidad: number
  subtotal: number
}

export interface Pago {
  id: string
  pedido_id: string
  estado: EstadoPago
  metodo: MetodoPago | null
  culqi_charge_id: string | null
  monto: number
  moneda: string
  ultimos_4_digitos: string | null
  marca_tarjeta: string | null
  error_mensaje: string | null
  created_at: string
}

export interface Pedido {
  id: string
  usuario_id: string | null
  numero: number
  estado: EstadoPedido
  subtotal: number
  igv: number
  costo_envio: number
  total: number
  moneda: string
  direccion_envio: DireccionEnvio
  nombre_comprador: string
  email_comprador: string
  telefono_comprador: string | null
  notas: string | null
  created_at: string
  updated_at: string
  items_pedido?: ItemPedido[]
  pagos?: Pago[]
}
