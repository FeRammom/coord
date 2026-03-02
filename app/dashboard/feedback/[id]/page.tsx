import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import type { FeedbackTemplate, FeedbackField } from '@/lib/types'
import { FeedbackFormFill } from '@/components/coordinator/feedback-form-fill'

export default async function FillFeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  const db = getDb()

  const template = db.prepare(`
    SELECT ft.*, e.title as event_title
    FROM feedback_templates ft
    JOIN events e ON ft.event_id = e.id
    WHERE ft.id = ? AND ft.is_active = 1
  `).get(parseInt(id)) as (FeedbackTemplate & { event_title: string }) | undefined

  if (!template) notFound()

  // Check if already responded
  const existing = db.prepare(
    'SELECT id FROM feedback_responses WHERE template_id = ? AND user_id = ?'
  ).get(template.id, session!.id)

  if (existing) {
    redirect('/dashboard/feedback')
  }

  const fields = db.prepare(
    'SELECT * FROM feedback_fields WHERE template_id = ? ORDER BY sort_order ASC'
  ).all(template.id) as FeedbackField[]

  return (
    <FeedbackFormFill
      template={template}
      fields={fields}
    />
  )
}
