import { PageHeader } from '@/components/page-header'
import { getDb } from '@/lib/db'
import type { FeedbackTemplate } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import { deleteFeedbackTemplateAction } from '@/app/actions/feedback'

export default async function AdminFeedbackPage() {
  const db = getDb()
  const templates = db.prepare(`
    SELECT ft.*, e.title as event_title,
      (SELECT COUNT(*) FROM feedback_responses WHERE template_id = ft.id) as response_count
    FROM feedback_templates ft
    JOIN events e ON ft.event_id = e.id
    ORDER BY ft.created_at DESC
  `).all() as (FeedbackTemplate & { response_count: number })[]

  return (
    <>
      <PageHeader title="Формы обратной связи" description="Конструктор форм для координаторов">
        <Link href="/admin/feedback/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Создать форму
          </Button>
        </Link>
      </PageHeader>
      <div className="flex-1 p-6">
        {templates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Форм обратной связи пока нет</p>
              <Link href="/admin/feedback/new">
                <Button className="mt-4" size="sm">Создать первую форму</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <Card key={t.id}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-base">{t.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{t.event_title}</p>
                  </div>
                  <Badge variant={t.is_active ? 'default' : 'secondary'}>
                    {t.is_active ? 'Активна' : 'Неактивна'}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {'Ответов: ' + t.response_count}
                  </p>
                  <div className="mt-3 flex items-center gap-1">
                    <Link href={`/admin/feedback/${t.id}/responses`}>
                      <Button variant="ghost" size="sm" title="Посмотреть ответы">
                        <Eye className="h-4 w-4" />
                        Ответы
                      </Button>
                    </Link>
                    <Link href={`/admin/feedback/${t.id}/edit`}>
                      <Button variant="ghost" size="sm" title="Редактировать">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <form action={async () => {
                      'use server'
                      await deleteFeedbackTemplateAction(t.id)
                    }}>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" title="Удалить">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
