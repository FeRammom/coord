import { PageHeader } from '@/components/page-header'
import { getDb } from '@/lib/db'
import type { User } from '@/lib/types'
import { CoordinatorsTable } from '@/components/admin/coordinators-table'
import { CoordinatorFormDialog } from '@/components/admin/coordinator-form-dialog'

export default async function AdminCoordinatorsPage() {
  const db = getDb()
  const coordinators = db.prepare(
    "SELECT * FROM users WHERE role = 'coordinator' ORDER BY created_at DESC"
  ).all() as User[]

  return (
    <>
      <PageHeader title="Координаторы" description="Управление учётными записями координаторов">
        <CoordinatorFormDialog mode="create" />
      </PageHeader>
      <div className="flex-1 p-6">
        <CoordinatorsTable coordinators={coordinators} />
      </div>
    </>
  )
}
