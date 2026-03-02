import { PageHeader } from '@/components/page-header'
import { getDb } from '@/lib/db'
import { notFound } from 'next/navigation'
import type { Event, Application, Rating } from '@/lib/types'
import { ApplicationsManager } from '@/components/admin/applications-manager'
import { RatingsManager } from '@/components/admin/ratings-manager'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, MapPin, Users } from 'lucide-react'
import { getSession } from '@/lib/auth'

const statusLabels: Record<string, string> = {
  planned: 'Планируется',
  active: 'Активно',
  completed: 'Завершено',
  cancelled: 'Отменено',
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = getDb()

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(parseInt(id)) as Event | undefined
  if (!event) notFound()

  const applications = db.prepare(`
    SELECT a.*, u.full_name as user_full_name, u.email as user_email, u.phone as user_phone, u.organization as user_organization
    FROM applications a
    JOIN users u ON a.user_id = u.id
    WHERE a.event_id = ?
    ORDER BY a.created_at DESC
  `).all(event.id) as Application[]

  const approvedApps = applications.filter((a) => a.status === 'approved')
  const ratings = db.prepare(`
    SELECT r.*, u.full_name as user_full_name
    FROM ratings r
    JOIN users u ON r.user_id = u.id
    WHERE r.event_id = ?
  `).all(event.id) as Rating[]

  const session = await getSession()

  return (
    <>
      <PageHeader title={event.title} description="Подробная информация о мероприятии" />
      <div className="flex-1 p-6">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-3 pt-6">
                <CalendarDays className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Дата</p>
                  <p className="text-sm font-medium">
                    {event.event_date
                      ? new Date(event.event_date).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Не указана'}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 pt-6">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Место</p>
                  <p className="text-sm font-medium">{event.location || 'Не указано'}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 pt-6">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Координаторы</p>
                  <p className="text-sm font-medium">
                    {applications.filter((a) => a.status === 'approved').length}
                    {event.max_coordinators ? ` / ${event.max_coordinators}` : ''}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {event.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Описание</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.description}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Заявки координаторов ({applications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ApplicationsManager applications={applications} />
            </CardContent>
          </Card>

          {approvedApps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Оценки координаторов</CardTitle>
              </CardHeader>
              <CardContent>
                <RatingsManager
                  eventId={event.id}
                  approvedCoordinators={approvedApps}
                  ratings={ratings}
                  adminId={session!.id}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
