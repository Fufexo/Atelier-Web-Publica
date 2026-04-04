import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/admin/Sidebar'
import ThemeProvider from '@/components/admin/ThemeProvider'

export const metadata = { title: 'Admin — Tienda de Ropa' }

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <ThemeProvider>
      <Sidebar />
      <main className="flex-1 overflow-auto text-gray-900">
        {children}
      </main>
    </ThemeProvider>
  )
}
