import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CoordinatorHeader } from '@/components/coordinator-header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session || session.role !== 'coordinator') redirect('/login')

  return (
    <div className="flex min-h-screen flex-col">
      <CoordinatorHeader session={session} />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
