'use server'

import { getDb } from '@/lib/db'
import { requireAdmin, getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

interface FieldData {
  id?: number
  field_type: string
  label: string
  options: string | null
  is_required: number
  sort_order: number
}

export async function createFeedbackTemplateAction(
  data: {
    event_id: number
    title: string
    fields: FieldData[]
  }
) {
  await requireAdmin()
  const db = getDb()

  const result = db.prepare(
    'INSERT INTO feedback_templates (event_id, title, is_active) VALUES (?, ?, 1)'
  ).run(data.event_id, data.title)

  const templateId = result.lastInsertRowid

  const insertField = db.prepare(
    'INSERT INTO feedback_fields (template_id, field_type, label, options, is_required, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
  )

  for (const field of data.fields) {
    insertField.run(templateId, field.field_type, field.label, field.options, field.is_required, field.sort_order)
  }

  revalidatePath('/admin/feedback')
  return { success: true, id: templateId }
}

export async function updateFeedbackTemplateAction(
  data: {
    id: number
    title: string
    is_active: number
    fields: FieldData[]
  }
) {
  await requireAdmin()
  const db = getDb()

  db.prepare('UPDATE feedback_templates SET title = ?, is_active = ? WHERE id = ?')
    .run(data.title, data.is_active, data.id)

  // Delete old fields and re-insert
  db.prepare('DELETE FROM feedback_fields WHERE template_id = ?').run(data.id)

  const insertField = db.prepare(
    'INSERT INTO feedback_fields (template_id, field_type, label, options, is_required, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
  )

  for (const field of data.fields) {
    insertField.run(data.id, field.field_type, field.label, field.options, field.is_required, field.sort_order)
  }

  revalidatePath('/admin/feedback')
  return { success: true }
}

export async function deleteFeedbackTemplateAction(id: number) {
  await requireAdmin()
  const db = getDb()
  db.prepare('DELETE FROM feedback_fields WHERE template_id = ?').run(id)
  db.prepare('DELETE FROM feedback_responses WHERE template_id = ?').run(id)
  db.prepare('DELETE FROM feedback_templates WHERE id = ?').run(id)
  revalidatePath('/admin/feedback')
}

export async function submitFeedbackAction(templateId: number, answers: Record<string, string | string[]>) {
  const session = await getSession()
  if (!session) return { error: 'Не авторизован' }

  const db = getDb()

  // Check if already submitted
  const existing = db.prepare(
    'SELECT id FROM feedback_responses WHERE template_id = ? AND user_id = ?'
  ).get(templateId, session.id)

  if (existing) {
    return { error: 'Вы уже заполнили эту форму' }
  }

  db.prepare(
    'INSERT INTO feedback_responses (template_id, user_id, answers) VALUES (?, ?, ?)'
  ).run(templateId, session.id, JSON.stringify(answers))

  revalidatePath('/dashboard/feedback')
  return { success: 'Ответ сохранён' }
}
