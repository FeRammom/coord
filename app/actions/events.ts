'use server'

import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createEventAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
) {
  await requireAdmin()
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const location = formData.get('location') as string
  const participant_limit = formData.get('participant_limit') as string
  const status = formData.get('status') as string

  if (!title) return { error: 'Введите название мероприятия' }

  const db = getDb()
  db.prepare(`
    INSERT INTO events (title, description, date, time, location, participant_limit, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    title,
    description || '',
    date || '',
    time || '',
    location || '',
    participant_limit ? parseInt(participant_limit) : 0,
    status || 'planned'
  )

  revalidatePath('/admin/events')
  return { success: 'Мероприятие создано' }
}

export async function updateEventAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
) {
  await requireAdmin()
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const location = formData.get('location') as string
  const participant_limit = formData.get('participant_limit') as string
  const status = formData.get('status') as string

  if (!title) return { error: 'Введите название мероприятия' }

  const db = getDb()
  db.prepare(`
    UPDATE events SET title = ?, description = ?, date = ?, time = ?, location = ?, participant_limit = ?, status = ?
    WHERE id = ?
  `).run(
    title,
    description || '',
    date || '',
    time || '',
    location || '',
    participant_limit ? parseInt(participant_limit) : 0,
    status || 'planned',
    parseInt(id)
  )

  revalidatePath('/admin/events')
  return { success: 'Мероприятие обновлено' }
}

export async function deleteEventAction(id: number) {
  await requireAdmin()
  const db = getDb()
  db.prepare('DELETE FROM feedback_responses WHERE event_id = ?').run(id)
  db.prepare('DELETE FROM feedback_fields WHERE template_id IN (SELECT id FROM feedback_templates WHERE event_id = ?)').run(id)
  db.prepare('DELETE FROM feedback_templates WHERE event_id = ?').run(id)
  db.prepare('DELETE FROM ratings WHERE event_id = ?').run(id)
  db.prepare('DELETE FROM applications WHERE event_id = ?').run(id)
  db.prepare('DELETE FROM events WHERE id = ?').run(id)
  revalidatePath('/admin/events')
}

export async function updateApplicationStatusAction(appId: number, status: 'approved' | 'rejected', rejectReason?: string) {
  await requireAdmin()
  const db = getDb()
  db.prepare('UPDATE applications SET status = ?, reject_reason = ? WHERE id = ?').run(status, rejectReason || '', appId)
  revalidatePath('/admin/events')
}
