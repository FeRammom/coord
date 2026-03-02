'use client'

import type { Application } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { updateApplicationStatusAction } from '@/app/actions/events'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const statusLabels: Record<string, string> = {
  pending: 'На рассмотрении',
  approved: 'Одобрена',
  rejected: 'Отклонена',
}

const statusColors: Record<string, string> = {
  pending: 'bg-warning/15 text-warning-foreground border-warning/30',
  approved: 'bg-success/15 text-success border-success/30',
  rejected: 'bg-destructive/10 text-destructive border-destructive/30',
}

export function ApplicationsManager({ applications }: { applications: Application[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<number | null>(null)

  const handleStatus = async (appId: number, status: 'approved' | 'rejected') => {
    setLoading(appId)
    await updateApplicationStatusAction(appId, status)
    setLoading(null)
    router.refresh()
  }

  if (applications.length === 0) {
    return <p className="text-sm text-muted-foreground">Заявок пока нет</p>
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ФИО</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Телефон</TableHead>
            <TableHead>Организация</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Дата подачи</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="font-medium">{app.user_full_name}</TableCell>
              <TableCell>{app.user_email || '—'}</TableCell>
              <TableCell>{app.user_phone || '—'}</TableCell>
              <TableCell>{app.user_organization || '—'}</TableCell>
              <TableCell>
                <Badge variant="outline" className={statusColors[app.status]}>
                  {statusLabels[app.status]}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(app.created_at).toLocaleDateString('ru-RU')}
              </TableCell>
              <TableCell>
                {app.status === 'pending' ? (
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-success hover:text-success"
                      title="Одобрить"
                      onClick={() => handleStatus(app.id, 'approved')}
                      disabled={loading === app.id}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      title="Отклонить"
                      onClick={() => handleStatus(app.id, 'rejected')}
                      disabled={loading === app.id}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
