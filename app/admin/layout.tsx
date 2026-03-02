import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  return (
    <SidebarProvider>
      <AdminSidebar session={session} />
      <SidebarInset>
        <div className="flex min-h-screen flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
