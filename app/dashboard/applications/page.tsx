import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'
import type { Application } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CancelApplicationButton } from '@/components/coordinator/cancel-application-button'

const statusLabels: Record<string, string> = {
  pending: 'На рассмотрении',
  approved: 'Одобрена',
  rejected: 'Отклонена',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
}

export default async function ApplicationsPage() {
  const session = await getSession()
  const db = getDb()

  const applications = db.prepare(`
    SELECT a.*, e.title as event_title, e.date as event_date, e.time as event_time, e.location
    FROM applications a
    JOIN events e ON a.event_id = e.id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
  `).all(session!.id) as (Application & { event_date: string | null; event_time: string | null; location: string | null })[]

  return (
    <>
      <h1 className="text-xl font-bold">Мои заявки</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Статус ваших заявок на участие в мероприятиях
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">У вас пока нет заявок</p>
            </CardContent>
          </Card>
        ) : (
          applications.map((app) => (
            <Card key={app.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{app.event_title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {app.event_date && (
                      <span>
                        {new Date(app.event_date).toLocaleDateString('ru-RU')}
                        {app.event_time ? `, ${app.event_time}` : ''}
                      </span>
                    )}
                    {app.location && <span>{app.location}</span>}
                    <span>{'Подана: ' + new Date(app.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                  {app.reject_reason && app.status === 'rejected' && (
                    <p className="mt-1 text-xs text-destructive">
                      {'Причина отклонения: ' + app.reject_reason}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariants[app.status]}>
                    {statusLabels[app.status]}
                  </Badge>
                  {app.status === 'pending' && (
                    <CancelApplicationButton applicationId={app.id} />
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  )
}
