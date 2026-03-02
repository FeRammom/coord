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
  const event_date = formData.get('event_date') as string
  const location = formData.get('location') as string
  const max_coordinators = formData.get('max_coordinators') as string
  const status = formData.get('status') as string

  if (!title) return { error: 'Введите название мероприятия' }

  const db = getDb()
  db.prepare(`
    INSERT INTO events (title, description, event_date, location, max_coordinators, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    title,
    description || null,
    event_date || null,
    location || null,
    max_coordinators ? parseInt(max_coordinators) : null,
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
  const event_date = formData.get('event_date') as string
  const location = formData.get('location') as string
  const max_coordinators = formData.get('max_coordinators') as string
  const status = formData.get('status') as string

  if (!title) return { error: 'Введите название мероприятия' }

  const db = getDb()
  db.prepare(`
    UPDATE events SET title = ?, description = ?, event_date = ?, location = ?, max_coordinators = ?, status = ?
    WHERE id = ?
  `).run(
    title,
    description || null,
    event_date || null,
    location || null,
    max_coordinators ? parseInt(max_coordinators) : null,
    status || 'planned',
    parseInt(id)
  )

  revalidatePath('/admin/events')
  return { success: 'Мероприятие обновлено' }
}

export async function deleteEventAction(id: number) {
  await requireAdmin()
  const db = getDb()
  db.prepare('DELETE FROM applications WHERE event_id = ?').run(id)
  db.prepare('DELETE FROM ratings WHERE event_id = ?').run(id)
  db.prepare('DELETE FROM feedback_templates WHERE event_id = ?').run(id)
  db.prepare('DELETE FROM events WHERE id = ?').run(id)
  revalidatePath('/admin/events')
}

export async function updateApplicationStatusAction(appId: number, status: 'approved' | 'rejected', comment?: string) {
  await requireAdmin()
  const db = getDb()
  db.prepare('UPDATE applications SET status = ?, comment = ? WHERE id = ?').run(status, comment || null, appId)
  revalidatePath('/admin/events')
}
