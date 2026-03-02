'use server'

import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function setRatingAction(
  eventId: number,
  userId: number,
  score: number,
  comment: string | null,
  ratedBy: number
) {
  await requireAdmin()
  const db = getDb()

  // Check if already rated
  const existing = db.prepare(
    'SELECT id FROM ratings WHERE event_id = ? AND user_id = ? AND rated_by = ?'
  ).get(eventId, userId, ratedBy)

  if (existing) {
    db.prepare(
      'UPDATE ratings SET score = ?, comment = ? WHERE id = ?'
    ).run(score, comment, (existing as { id: number }).id)
  } else {
    db.prepare(
      'INSERT INTO ratings (event_id, user_id, score, comment, rated_by) VALUES (?, ?, ?, ?, ?)'
    ).run(eventId, userId, score, comment, ratedBy)
  }

  revalidatePath(`/admin/events/${eventId}`)
  revalidatePath('/admin/stats')
}
