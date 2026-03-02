import { PageHeader } from '@/components/page-header'
import { getDb } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Star, CalendarDays, TrendingUp } from 'lucide-react'
import { ExportCoordinatorsButton } from '@/components/admin/export-coordinators-button'

interface CoordinatorWithRating {
  id: number
  full_name: string
  direction: string
  group_name: string
  phone: string
  residence: string
  avg_rating: number | null
  ratings_count: number
}

interface RatingDetail {
  event_id: number
  event_title: string
  event_date: string
  score: number
  admin_full_name: string
}

export default async function AdminStatsPage() {
  const db = getDb()

  const coordinators = db.prepare(`
    SELECT u.id, u.full_name, u.direction, u.group_name, u.phone, u.residence,
           ROUND(AVG(r.score), 1) as avg_rating,
           COUNT(r.id) as ratings_count
    FROM users u
    LEFT JOIN ratings r ON r.user_id = u.id
    WHERE u.role = 'coordinator'
    GROUP BY u.id
    ORDER BY avg_rating DESC NULLS LAST
  `).all() as CoordinatorWithRating[]

  const totalCoordinators = coordinators.length
  const ratedCoordinators = coordinators.filter((c) => c.avg_rating !== null).length
  const overallAvg = ratedCoordinators > 0
    ? (coordinators.reduce((sum, c) => sum + (c.avg_rating || 0), 0) / ratedCoordinators).toFixed(1)
    : '-'

  // Get all ratings details for expandable view
  const allRatings = db.prepare(`
    SELECT r.user_id, r.event_id, r.score, e.title as event_title, e.date as event_date,
           adm.full_name as admin_full_name
    FROM ratings r
    JOIN events e ON r.event_id = e.id
    JOIN users adm ON r.admin_id = adm.id
    ORDER BY e.date DESC
  `).all() as (RatingDetail & { user_id: number })[]

  const ratingsByUser: Record<number, RatingDetail[]> = {}
  for (const r of allRatings) {
    if (!ratingsByUser[r.user_id]) ratingsByUser[r.user_id] = []
    ratingsByUser[r.user_id].push(r)
  }

  const stats = [
    { title: 'Всего координаторов', value: totalCoordinators, icon: Users },
    { title: 'С оценками', value: ratedCoordinators, icon: Star },
    { title: 'Средний балл', value: overallAvg, icon: TrendingUp },
    { title: 'Всего оценок', value: allRatings.length, icon: CalendarDays },
  ]

  return (
    <>
      <PageHeader title="Статистика" description="Рейтинг и статистика координаторов">
        <ExportCoordinatorsButton coordinators={coordinators} ratingsByUser={ratingsByUser} />
      </PageHeader>
      <div className="flex-1 p-6">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Рейтинг координаторов</CardTitle>
            </CardHeader>
            <CardContent>
              {coordinators.length === 0 ? (
                <p className="text-sm text-muted-foreground">Нет координаторов</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">ФИО</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Направление</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Группа</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Телефон</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Проживание</th>
                        <th className="px-3 py-2 text-center font-medium text-muted-foreground">Средний балл</th>
                        <th className="px-3 py-2 text-center font-medium text-muted-foreground">Оценок</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coordinators.map((coord) => (
                        <CoordinatorRow key={coord.id} coordinator={coord} ratings={ratingsByUser[coord.id] || []} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

function CoordinatorRow({ coordinator, ratings }: { coordinator: CoordinatorWithRating; ratings: RatingDetail[] }) {
  const ratingColor = coordinator.avg_rating
    ? coordinator.avg_rating >= 8
      ? 'text-green-600 dark:text-green-400'
      : coordinator.avg_rating >= 5
        ? 'text-yellow-600 dark:text-yellow-400'
        : 'text-red-600 dark:text-red-400'
    : 'text-muted-foreground'

  return (
    <>
      <tr className="border-b hover:bg-muted/50 transition-colors">
        <td className="px-3 py-3 font-medium">{coordinator.full_name}</td>
        <td className="px-3 py-3 text-muted-foreground">{coordinator.direction || '-'}</td>
        <td className="px-3 py-3 text-muted-foreground">{coordinator.group_name || '-'}</td>
        <td className="px-3 py-3 text-muted-foreground">{coordinator.phone || '-'}</td>
        <td className="px-3 py-3 text-muted-foreground">{coordinator.residence || '-'}</td>
        <td className={`px-3 py-3 text-center font-semibold ${ratingColor}`}>
          {coordinator.avg_rating ?? '-'}
        </td>
        <td className="px-3 py-3 text-center text-muted-foreground">{coordinator.ratings_count}</td>
      </tr>
      {ratings.length > 0 && (
        <tr>
          <td colSpan={7} className="px-3 pb-3">
            <details className="group">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
                {'Подробнее по этапам (' + ratings.length + ')'}
              </summary>
              <div className="mt-2 rounded-md border bg-muted/30 p-3">
                <div className="flex flex-col gap-1.5">
                  {ratings.map((r) => (
                    <div key={r.event_id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{r.event_title}</span>
                        {r.event_date && (
                          <span className="text-muted-foreground">
                            {new Date(r.event_date).toLocaleDateString('ru-RU')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {r.score + ' / 10'}
                        </Badge>
                        <span className="text-muted-foreground">{'(' + r.admin_full_name + ')'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          </td>
        </tr>
      )}
    </>
  )
}
