import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'
import type { FeedbackTemplate, FeedbackField } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'

export default async function DashboardFeedbackPage() {
  const session = await getSession()
  const db = getDb()

  // Get templates for events where the coordinator is approved
  const templates = db.prepare(`
    SELECT ft.*, e.title as event_title
    FROM feedback_templates ft
    JOIN events e ON ft.event_id = e.id
    JOIN applications a ON a.event_id = e.id AND a.user_id = ? AND a.status = 'approved'
    WHERE ft.is_active = 1
    ORDER BY ft.created_at DESC
  `).all(session!.id) as (FeedbackTemplate & { event_title: string })[]

  // Check which ones are already filled
  const respondedIds = db.prepare(
    'SELECT template_id FROM feedback_responses WHERE user_id = ?'
  ).all(session!.id) as { template_id: number }[]

  const respondedSet = new Set(respondedIds.map((r) => r.template_id))

  return (
    <>
      <h1 className="text-xl font-bold">Обратная связь</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Формы обратной связи для ваших мероприятий
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {templates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Нет доступных форм обратной связи</p>
            </CardContent>
          </Card>
        ) : (
          templates.map((t) => {
            const filled = respondedSet.has(t.id)
            return (
              <Card key={t.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{t.event_title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {filled ? (
                      <Badge variant="default">Заполнено</Badge>
                    ) : (
                      <Link href={`/dashboard/feedback/${t.id}`}>
                        <Button size="sm">Заполнить</Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </>
  )
}
