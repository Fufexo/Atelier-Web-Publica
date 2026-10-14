'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { esEstadoPedido } from '@/lib/pedidos'

export async function actualizarEstadoPedido(id: string, estado: string): Promise<void> {
  // Los argumentos de una Server Action llegan del cliente: se validan aunque el tipo diga otra cosa.
  if (!esEstadoPedido(estado)) throw new Error(`Estado inválido: ${estado}`)
  const { supabase } = await requireAdmin()

  const { error } = await supabase.from('pedidos').update({ estado }).eq('id', id)
  if (error) throw new Error(`No se pudo actualizar el pedido: ${error.message}`)

  revalidatePath('/admin/pedidos')
  revalidatePath(`/admin/pedidos/${id}`)
  revalidatePath('/admin')
}
