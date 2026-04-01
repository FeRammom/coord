import { PageHeader } from '@/components/page-header'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { CalendarDays, Users, ClipboardList, MessageSquareText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminPage() {
  const session = await getSession()
  const db = getDb()

  const eventsCount = (db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number }).count
  const coordinatorsCount = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'coordinator'").get() as { count: number }).count
  const pendingApps = (db.prepare("SELECT COUNT(*) as count FROM applications WHERE status = 'pending'").get() as { count: number }).count
  const feedbackCount = (db.prepare('SELECT COUNT(*) as count FROM feedback_templates').get() as { count: number }).count

  const stats = [
    { title: 'Мероприятия', value: eventsCount, icon: CalendarDays, color: 'text-primary' },
    { title: 'Координаторы', value: coordinatorsCount, icon: Users, color: 'text-chart-2' },
    { title: 'Заявки на рассмотрении', value: pendingApps, icon: ClipboardList, color: 'text-warning' },
    { title: 'Формы ОС', value: feedbackCount, icon: MessageSquareText, color: 'text-chart-3' },
  ]

  return (
    <>
      <PageHeader
        title={`Добро пожаловать, ${session?.fullName || 'Администратор'}`}
        description="Обзор системы координаторов"
      />
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="py-0 gap-0">
              <CardHeader className="flex flex-row items-center justify-between py-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
