import { PageHeader } from '@/components/page-header'
import { getDb } from '@/lib/db'
import { notFound } from 'next/navigation'
import type { FeedbackTemplate, FeedbackField, FeedbackResponse } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function FeedbackResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = getDb()

  const template = db.prepare(`
    SELECT ft.*, e.title as event_title
    FROM feedback_templates ft
    JOIN events e ON ft.event_id = e.id
    WHERE ft.id = ?
  `).get(parseInt(id)) as (FeedbackTemplate & { event_title: string }) | undefined
  if (!template) notFound()

  const fields = db.prepare(
    'SELECT * FROM feedback_fields WHERE template_id = ? ORDER BY sort_order ASC'
  ).all(template.id) as FeedbackField[]

  const responses = db.prepare(`
    SELECT fr.*, u.full_name as user_full_name
    FROM feedback_responses fr
    JOIN users u ON fr.user_id = u.id
    WHERE fr.template_id = ?
    ORDER BY fr.created_at DESC
  `).all(template.id) as FeedbackResponse[]

  return (
    <>
      <PageHeader
        title={`Ответы: ${template.title}`}
        description={`Мероприятие: ${template.event_title} | Всего ответов: ${responses.length}`}
      />
      <div className="flex-1 p-6">
        {responses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Ответов пока нет</p>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Координатор</TableHead>
                  {fields.map((f) => (
                    <TableHead key={f.id}>{f.label}</TableHead>
                  ))}
                  <TableHead>Дата</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((resp) => {
                  const answers = JSON.parse(resp.answers) as Record<string, string | string[]>
                  return (
                    <TableRow key={resp.id}>
                      <TableCell className="font-medium">{resp.user_full_name}</TableCell>
                      {fields.map((f) => {
                        const val = answers[f.id.toString()] || answers[f.label] || '—'
                        return (
                          <TableCell key={f.id}>
                            {Array.isArray(val) ? val.join(', ') : String(val)}
                          </TableCell>
                        )
                      })}
                      <TableCell className="text-muted-foreground">
                        {new Date(resp.created_at).toLocaleDateString('ru-RU')}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  )
}
