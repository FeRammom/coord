'use server'

import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function applyToEventAction(eventId: number) {
  const session = await getSession()
  if (!session || session.role !== 'coordinator') {
    return { error: 'Не авторизован' }
  }

  const db = getDb()

  // Check if already applied
  const existing = db.prepare(
    'SELECT id FROM applications WHERE event_id = ? AND user_id = ?'
  ).get(eventId, session.id)

  if (existing) {
    return { error: 'Вы уже подали заявку на это мероприятие' }
  }

  // Check event exists and is open
  const event = db.prepare(
    "SELECT * FROM events WHERE id = ? AND status IN ('planned', 'active')"
  ).get(eventId)

  if (!event) {
    return { error: 'Мероприятие недоступно для подачи заявки' }
  }

  db.prepare(
    'INSERT INTO applications (event_id, user_id, status) VALUES (?, ?, ?)'
  ).run(eventId, session.id, 'pending')

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/applications')
  return { success: 'Заявка подана' }
}

export async function cancelApplicationAction(applicationId: number) {
  const session = await getSession()
  if (!session || session.role !== 'coordinator') {
    return { error: 'Не авторизован' }
  }

  const db = getDb()
  const app = db.prepare(
    "SELECT * FROM applications WHERE id = ? AND user_id = ? AND status = 'pending'"
  ).get(applicationId, session.id)

  if (!app) {
    return { error: 'Заявка не найдена или уже рассмотрена' }
  }

  db.prepare('DELETE FROM applications WHERE id = ?').run(applicationId)
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/applications')
  return { success: 'Заявка отменена' }
}
