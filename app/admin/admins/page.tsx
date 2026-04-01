import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { PageHeader } from '@/components/page-header'
import { AdminsTable } from '@/components/admin/admins-table'
import type { User } from '@/lib/types'

export default async function AdminsPage() {
  const session = await getSession()
  
  // Только главный админ может видеть эту страницу
  if (!session || session.role !== 'admin' || !session.isSuper) {
    redirect('/admin')
  }

  const db = getDb()
  const admins = db.prepare(`
    SELECT id, login, full_name, is_super, created_at
    FROM users
    WHERE role = 'admin'
    ORDER BY is_super DESC, created_at DESC
  `).all() as User[]

  return (
    <div>
      <PageHeader
        title="Администраторы"
        description="Управление младшими администраторами системы"
      />
      <AdminsTable admins={admins} />
    </div>
  )
}
