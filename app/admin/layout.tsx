import type { Metadata } from 'next'
import Sidebar from '@/components/admin/Sidebar'
import ThemeProvider from '@/components/admin/ThemeProvider'
import { requireAdmin } from '@/lib/auth'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s — Admin ATELIER' },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  // proxy.ts ya exige sesión; aquí además se exige ser admin.
  await requireAdmin()

  return (
    <ThemeProvider>
      <Sidebar />
      <main className="flex-1 overflow-auto text-gray-900">{children}</main>
    </ThemeProvider>
  )
}
