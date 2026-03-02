'use server'

import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function setRatingAction(
  eventId: number,
  userId: number,
  score: number,
  adminId: number
) {
  await requireAdmin()
  const db = getDb()

  const existing = db.prepare(
    'SELECT id FROM ratings WHERE event_id = ? AND user_id = ?'
  ).get(eventId, userId) as { id: number } | undefined

  if (existing) {
    db.prepare(
      'UPDATE ratings SET score = ?, admin_id = ? WHERE id = ?'
    ).run(score, adminId, existing.id)
  } else {
    db.prepare(
      'INSERT INTO ratings (event_id, user_id, score, admin_id) VALUES (?, ?, ?, ?)'
    ).run(eventId, userId, score, adminId)
  }

  revalidatePath(`/admin/events/${eventId}`)
  revalidatePath('/admin/stats')
}
