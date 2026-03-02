import { getDb } from '@/lib/db'
import { notFound } from 'next/navigation'
import type { Event, FeedbackTemplate, FeedbackField } from '@/lib/types'
import { FeedbackFormBuilder } from '@/components/admin/feedback-form-builder'

export default async function EditFeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = getDb()

  const template = db.prepare('SELECT * FROM feedback_templates WHERE id = ?').get(parseInt(id)) as FeedbackTemplate | undefined
  if (!template) notFound()

  const fields = db.prepare('SELECT * FROM feedback_fields WHERE template_id = ? ORDER BY sort_order ASC').all(template.id) as FeedbackField[]
  template.fields = fields

  const events = db.prepare('SELECT * FROM events ORDER BY title ASC').all() as Event[]

  return <FeedbackFormBuilder events={events} template={template} />
}
