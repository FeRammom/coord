import { PageHeader } from '@/components/page-header'
import { getDb } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, Users, ClipboardList, Star, MessageSquareText, TrendingUp } from 'lucide-react'

interface TopCoordinator {
  full_name: string
  avg_score: number
  event_count: number
}

export default async function AdminStatsPage() {
  const db = getDb()

  // General stats
  const totalEvents = (db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number }).count
  const completedEvents = (db.prepare("SELECT COUNT(*) as count FROM events WHERE status = 'completed'").get() as { count: number }).count
  const totalCoordinators = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'coordinator'").get() as { count: number }).count
  const totalApplications = (db.prepare('SELECT COUNT(*) as count FROM applications').get() as { count: number }).count
  const approvedApplications = (db.prepare("SELECT COUNT(*) as count FROM applications WHERE status = 'approved'").get() as { count: number }).count
  const totalRatings = (db.prepare('SELECT COUNT(*) as count FROM ratings').get() as { count: number }).count
  const avgRating = (db.prepare('SELECT AVG(score) as avg FROM ratings').get() as { avg: number | null }).avg || 0
  const totalFeedbackResponses = (db.prepare('SELECT COUNT(*) as count FROM feedback_responses').get() as { count: number }).count

  // Top coordinators by average rating
  const topCoordinators = db.prepare(`
    SELECT u.full_name, 
           AVG(r.score) as avg_score,
           COUNT(DISTINCT r.event_id) as event_count
    FROM ratings r
    JOIN users u ON r.user_id = u.id
    GROUP BY r.user_id
    HAVING COUNT(*) >= 1
    ORDER BY avg_score DESC
    LIMIT 5
  `).all() as TopCoordinator[]

  // Recent events with coordinator counts
  const recentEvents = db.prepare(`
    SELECT e.title, e.event_date, e.status,
           (SELECT COUNT(*) FROM applications a WHERE a.event_id = e.id AND a.status = 'approved') as coordinator_count
    FROM events e
    ORDER BY e.created_at DESC
    LIMIT 5
  `).all() as { title: string; event_date: string | null; status: string; coordinator_count: number }[]

  const statusLabels: Record<string, string> = {
    planned: 'Планируется',
    active: 'Активно',
    completed: 'Завершено',
    cancelled: 'Отменено',
  }

  return (
    <>
      <PageHeader title="Статистика" description="Обзор ключевых показателей системы" />
      <div className="flex-1 p-6">
        <div className="flex flex-col gap-6">
          {/* Key metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Всего мероприятий
                </CardTitle>
                <CalendarDays className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEvents}</div>
                <p className="text-xs text-muted-foreground">{'Завершено: ' + completedEvents}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Координаторы
                </CardTitle>
                <Users className="h-5 w-5 text-chart-2" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCoordinators}</div>
                <p className="text-xs text-muted-foreground">Зарегистрировано в системе</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Заявки
                </CardTitle>
                <ClipboardList className="h-5 w-5 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalApplications}</div>
                <p className="text-xs text-muted-foreground">{'Одобрено: ' + approvedApplications}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Средняя оценка
                </CardTitle>
                <Star className="h-5 w-5 text-chart-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">{'Всего оценок: ' + totalRatings}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Top coordinators */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Лучшие координаторы
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topCoordinators.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Оценок пока нет</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {topCoordinators.map((coord, i) => (
                      <div key={coord.full_name} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{coord.full_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {'Мероприятий: ' + coord.event_count}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1">
                          <Star className="h-3 w-3 text-primary" />
                          <span className="text-sm font-medium text-primary">
                            {Number(coord.avg_score).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Последние мероприятия
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Мероприятий пока нет</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {recentEvents.map((event) => (
                      <div key={event.title} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="text-sm font-medium">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.event_date
                              ? new Date(event.event_date).toLocaleDateString('ru-RU')
                              : 'Дата не указана'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-muted-foreground">
                            {statusLabels[event.status]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {'Координаторов: ' + event.coordinator_count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Feedback stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquareText className="h-4 w-4 text-primary" />
                Обратная связь
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-2xl font-bold">{totalFeedbackResponses}</p>
                  <p className="text-sm text-muted-foreground">Всего ответов</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
