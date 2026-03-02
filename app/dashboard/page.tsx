import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { CalendarDays, ClipboardList, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Application, Event } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ApplyButton } from '@/components/coordinator/apply-button'

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

export default async function DashboardPage() {
  const session = await getSession()
  const db = getDb()

  const myApps = db.prepare(`
    SELECT a.*, e.title as event_title 
    FROM applications a 
    JOIN events e ON a.event_id = e.id 
    WHERE a.user_id = ? 
    ORDER BY a.created_at DESC 
    LIMIT 5
  `).all(session!.id) as Application[]

  const availableEvents = db.prepare(`
    SELECT e.* FROM events e 
    WHERE e.status IN ('planned', 'active')
    AND e.id NOT IN (SELECT event_id FROM applications WHERE user_id = ?)
    ORDER BY e.date ASC
    LIMIT 5
  `).all(session!.id) as Event[]

  return (
    <>
      <h1 className="text-xl font-bold text-foreground">
        {'Добро пожаловать, ' + (session?.fullName || 'Координатор')}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Ваша панель координатора</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4 text-primary" />
              Доступные мероприятия
            </CardTitle>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Все</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {availableEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Нет доступных мероприятий</p>
            ) : (
              <div className="flex flex-col gap-3">
                {availableEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      {event.date && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleDateString('ru-RU')}
                          {event.time ? `, ${event.time}` : ''}
                        </p>
                      )}
                    </div>
                    <ApplyButton eventId={event.id} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4 text-primary" />
              Мои заявки
            </CardTitle>
            <Link href="/dashboard/applications">
              <Button variant="ghost" size="sm">Все</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {myApps.length === 0 ? (
              <p className="text-sm text-muted-foreground">У вас пока нет заявок</p>
            ) : (
              <div className="flex flex-col gap-3">
                {myApps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{app.event_title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(app.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <Badge variant={statusVariants[app.status]}>
                      {statusLabels[app.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
