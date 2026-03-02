import { getDb } from '@/lib/db'
import type { Event } from '@/lib/types'
import { FeedbackFormBuilder } from '@/components/admin/feedback-form-builder'

export default async function NewFeedbackPage() {
  const db = getDb()
  const events = db.prepare('SELECT * FROM events ORDER BY title ASC').all() as Event[]

  return <FeedbackFormBuilder events={events} />
}
