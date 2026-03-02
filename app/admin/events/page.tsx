import { PageHeader } from '@/components/page-header'
import { getDb } from '@/lib/db'
import type { Event } from '@/lib/types'
import { EventsTable } from '@/components/admin/events-table'
import { EventFormDialog } from '@/components/admin/event-form-dialog'

export default async function AdminEventsPage() {
  const db = getDb()
  const events = db.prepare('SELECT * FROM events ORDER BY created_at DESC').all() as Event[]

  return (
    <>
      <PageHeader title="Мероприятия" description="Управление мероприятиями">
        <EventFormDialog mode="create" />
      </PageHeader>
      <div className="flex-1 p-6">
        <EventsTable events={events} />
      </div>
    </>
  )
}
