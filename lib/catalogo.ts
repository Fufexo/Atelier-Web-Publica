import 'server-only'
import { createClient } from '@/lib/supabase/server'
import {
  esGenero,
  parsearImagenes,
  type Categoria,
  type Genero,
  type Producto,
  type ProductoResumen,
  type Variante,
} from '@/lib/types'

// Consultas de la tienda pública. Usan el cliente con la anon key, así que RLS
// garantiza que solo salgan productos, variantes y categorías activos.

const COLUMNAS_RESUMEN = 'id, slug, nombre, precio, precio_oferta, imagenes, categorias(nombre)'

interface FilaResumen {
  id: string
  slug: string
  nombre: string
  precio: number
  precio_oferta: number | null
  imagenes: Parameters<typeof parsearImagenes>[0]
  categorias: { nombre: string } | null
}

function aResumen(fila: FilaResumen): ProductoResumen {
  return {
    id: fila.id,
    slug: fila.slug,
    nombre: fila.nombre,
    precio: fila.precio,
    precio_oferta: fila.precio_oferta,
    imagenes: parsearImagenes(fila.imagenes),
    categoria: fila.categorias?.nombre ?? null,
  }
}

/** Productos de la portada: primero los destacados y, si faltan, los más recientes. */
export async function getProductosPortada(limite = 4): Promise<ProductoResumen[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('productos')
    .select(COLUMNAS_RESUMEN)
    .eq('activo', true)
    .order('destacado', { ascending: false })
    .order('orden', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(limite)

  if (error) throw new Error(`No se pudieron cargar los productos: ${error.message}`)
  return data.map(aResumen)
}

export interface FiltrosCatalogo {
  genero?: Genero
  categoria?: string
  novedad?: boolean
  oferta?: boolean
  busqueda?: string
}

/** Lee los filtros de la URL descartando valores que no existen. */
export function leerFiltros(params: Record<string, string | string[] | undefined>): FiltrosCatalogo {
  const texto = (k: string) => {
    const v = params[k]
    return typeof v === 'string' ? v.trim() : undefined
  }
  const genero = texto('genero')
  return {
    genero: esGenero(genero) ? genero : undefined,
    categoria: texto('categoria') || undefined,
    novedad: texto('novedad') === 'true',
    oferta: texto('oferta') === 'true',
    busqueda: texto('q')?.slice(0, 80) || undefined,
  }
}

/** `%` y `_` son comodines en ILIKE: se escapan para buscar el texto literal. */
function escaparLike(texto: string): string {
  return texto.replace(/[\\%_]/g, (c) => `\\${c}`)
}

export async function getCatalogo(filtros: FiltrosCatalogo): Promise<ProductoResumen[]> {
  const supabase = await createClient()
  // `!inner` convierte el join en filtro: solo productos de esa categoría.
  const columnas = filtros.categoria
    ? 'id, slug, nombre, precio, precio_oferta, imagenes, categorias!inner(nombre, slug)'
    : COLUMNAS_RESUMEN

  let query = supabase
    .from('productos')
    .select(columnas)
    .eq('activo', true)
    .order('orden', { ascending: true })
    .order('created_at', { ascending: false })

  if (filtros.genero) query = query.eq('genero', filtros.genero)
  if (filtros.categoria) query = query.eq('categorias.slug', filtros.categoria)
  if (filtros.novedad) query = query.eq('destacado', true)
  if (filtros.oferta) query = query.not('precio_oferta', 'is', null)
  if (filtros.busqueda) query = query.ilike('nombre', `%${escaparLike(filtros.busqueda)}%`)

  const { data, error } = await query.overrideTypes<FilaResumen[], { merge: false }>()
  if (error) throw new Error(`No se pudo cargar el catálogo: ${error.message}`)
  return data.map(aResumen)
}

export async function getCategoriasActivas(): Promise<Categoria[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('categorias').select('*').eq('activa', true).order('orden')

  if (error) throw new Error(`No se pudieron cargar las categorías: ${error.message}`)
  return data
}

export type ProductoDetalle = Producto & {
  categoria: { nombre: string; slug: string } | null
  variantes: Variante[]
}

export async function getProductoPorSlug(slug: string): Promise<ProductoDetalle | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('productos')
    .select('*, categorias(nombre, slug), variantes(*)')
    .eq('slug', slug)
    .eq('activo', true)
    .maybeSingle()

  if (error) throw new Error(`No se pudo cargar el producto: ${error.message}`)
  if (!data) return null

  const { categorias, variantes, imagenes, genero, ...resto } = data
  return {
    ...resto,
    genero: esGenero(genero) ? genero : 'unisex',
    imagenes: parsearImagenes(imagenes),
    categoria: categorias,
    variantes: variantes.filter((v) => v.activa),
  }
}

/** Slugs de todos los productos activos, para el sitemap. */
export async function getSlugsProductos(): Promise<{ slug: string; updated_at: string }[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('productos').select('slug, updated_at').eq('activo', true)
  return data ?? []
}
