'use client'

import { useState } from 'react'
import type { Application, Rating } from '@/lib/types'
import { setRatingAction } from '@/app/actions/ratings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function RatingsManager({
  eventId,
  approvedCoordinators,
  ratings,
  adminId,
}: {
  eventId: number
  approvedCoordinators: Application[]
  ratings: Rating[]
  adminId: number
}) {
  const router = useRouter()
  const [scores, setScores] = useState<Record<number, number>>(() => {
    const map: Record<number, number> = {}
    for (const r of ratings) {
      map[r.user_id] = r.score
    }
    return map
  })
  const [comments, setComments] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {}
    for (const r of ratings) {
      map[r.user_id] = r.comment || ''
    }
    return map
  })
  const [saving, setSaving] = useState<number | null>(null)

  const handleSave = async (userId: number) => {
    const score = scores[userId]
    if (!score || score < 1 || score > 10) {
      toast.error('Оценка должна быть от 1 до 10')
      return
    }
    setSaving(userId)
    await setRatingAction(eventId, userId, score, comments[userId] || null, adminId)
    setSaving(null)
    toast.success('Оценка сохранена')
    router.refresh()
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Координатор</TableHead>
            <TableHead>Оценка (1-10)</TableHead>
            <TableHead>Комментарий</TableHead>
            <TableHead className="text-right">Действие</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {approvedCoordinators.map((app) => (
            <TableRow key={app.user_id}>
              <TableCell className="font-medium">{app.user_full_name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setScores({ ...scores, [app.user_id]: n })}
                      className={`flex h-7 w-7 items-center justify-center rounded text-xs font-medium transition-colors ${
                        scores[app.user_id] === n
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-input bg-card hover:bg-accent'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Input
                  value={comments[app.user_id] || ''}
                  onChange={(e) => setComments({ ...comments, [app.user_id]: e.target.value })}
                  placeholder="Комментарий..."
                  className="max-w-xs"
                />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  onClick={() => handleSave(app.user_id)}
                  disabled={saving === app.user_id || !scores[app.user_id]}
                >
                  {saving === app.user_id ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
