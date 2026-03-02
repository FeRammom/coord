'use server'

import { getDb } from '@/lib/db'
import { requireAdmin, getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

interface FieldData {
  field_type: string
  label: string
  required: number
  sort_order: number
}

export async function createFeedbackTemplateAction(
  data: {
    event_id: number
    name: string
    fields: FieldData[]
  }
) {
  await requireAdmin()
  const db = getDb()

  const result = db.prepare(
    'INSERT INTO feedback_templates (event_id, name, is_active) VALUES (?, ?, 1)'
  ).run(data.event_id, data.name)

  const templateId = result.lastInsertRowid

  const insertField = db.prepare(
    'INSERT INTO feedback_fields (template_id, field_type, label, required, sort_order) VALUES (?, ?, ?, ?, ?)'
  )

  for (const field of data.fields) {
    insertField.run(templateId, field.field_type, field.label, field.required, field.sort_order)
  }

  revalidatePath('/admin/feedback')
  return { success: true, id: templateId }
}

export async function updateFeedbackTemplateAction(
  data: {
    id: number
    name: string
    is_active: number
    fields: FieldData[]
  }
) {
  await requireAdmin()
  const db = getDb()

  db.prepare('UPDATE feedback_templates SET name = ?, is_active = ? WHERE id = ?')
    .run(data.name, data.is_active, data.id)

  // Delete old fields and re-insert
  db.prepare('DELETE FROM feedback_responses WHERE field_id IN (SELECT id FROM feedback_fields WHERE template_id = ?)').run(data.id)
  db.prepare('DELETE FROM feedback_fields WHERE template_id = ?').run(data.id)

  const insertField = db.prepare(
    'INSERT INTO feedback_fields (template_id, field_type, label, required, sort_order) VALUES (?, ?, ?, ?, ?)'
  )

  for (const field of data.fields) {
    insertField.run(data.id, field.field_type, field.label, field.required, field.sort_order)
  }

  revalidatePath('/admin/feedback')
  return { success: true }
}

export async function deleteFeedbackTemplateAction(id: number) {
  await requireAdmin()
  const db = getDb()
  db.prepare('DELETE FROM feedback_responses WHERE field_id IN (SELECT id FROM feedback_fields WHERE template_id = ?)').run(id)
  db.prepare('DELETE FROM feedback_fields WHERE template_id = ?').run(id)
  db.prepare('DELETE FROM feedback_templates WHERE id = ?').run(id)
  revalidatePath('/admin/feedback')
}

export async function submitFeedbackAction(
  templateId: number,
  eventId: number,
  answers: Record<string, string>
) {
  const session = await getSession()
  if (!session) return { error: 'Не авторизован' }

  const db = getDb()

  // Check if already submitted for this template+event
  const existing = db.prepare(`
    SELECT fr.id FROM feedback_responses fr
    JOIN feedback_fields ff ON fr.field_id = ff.id
    WHERE ff.template_id = ? AND fr.event_id = ? AND fr.user_id = ?
    LIMIT 1
  `).get(templateId, eventId, session.id)

  if (existing) {
    return { error: 'Вы уже заполнили эту форму' }
  }

  const insertResponse = db.prepare(
    'INSERT INTO feedback_responses (user_id, field_id, event_id, value) VALUES (?, ?, ?, ?)'
  )

  const insertMany = db.transaction((entries: Array<{ fieldId: number; value: string }>) => {
    for (const entry of entries) {
      insertResponse.run(session.id, entry.fieldId, eventId, entry.value)
    }
  })

  const entries = Object.entries(answers).map(([fieldId, value]) => ({
    fieldId: parseInt(fieldId),
    value: String(value),
  }))

  insertMany(entries)

  revalidatePath('/dashboard/feedback')
  return { success: 'Ответ сохранён' }
}
