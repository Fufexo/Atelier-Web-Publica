'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { EstadoPedido } from '@/lib/types'

export async function actualizarEstadoPedido(id: string, estado: EstadoPedido) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('pedidos').update({ estado }).eq('id', id)

  revalidatePath('/admin/pedidos')
  revalidatePath(`/admin/pedidos/${id}`)
}
