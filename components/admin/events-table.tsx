'use client'

import { useState } from 'react'
import type { Event } from '@/lib/types'
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
import { Trash2, Eye, Pencil, ArrowUpDown } from 'lucide-react'
import { deleteEventAction } from '@/app/actions/events'
import { EventFormDialog } from './event-form-dialog'
import Link from 'next/link'
import { Input } from '@/components/ui/input'

const statusLabels: Record<string, string> = {
  planned: 'Планируется',
  active: 'Активно',
  completed: 'Завершено',
  cancelled: 'Отменено',
}

const statusColors: Record<string, string> = {
  planned: 'bg-secondary text-secondary-foreground',
  active: 'bg-primary text-primary-foreground',
  completed: 'bg-success text-success-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
}

export function EventsTable({ events }: { events: Event[] }) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<'title' | 'event_date' | 'status'>('event_date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = events
    .filter((e) => e.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortKey] ?? ''
      const bVal = b[sortKey] ?? ''
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortDir === 'asc' ? cmp : -cmp
    })

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Поиск по названию..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button onClick={() => toggleSort('title')} className="flex items-center gap-1 font-medium">
                  Название <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => toggleSort('event_date')} className="flex items-center gap-1 font-medium">
                  Дата <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Место</TableHead>
              <TableHead>
                <button onClick={() => toggleSort('status')} className="flex items-center gap-1 font-medium">
                  Статус <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Макс. координаторов</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Мероприятий не найдено
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>
                    {event.event_date
                      ? new Date(event.event_date).toLocaleDateString('ru-RU')
                      : '—'}
                  </TableCell>
                  <TableCell>{event.location || '—'}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[event.status]} variant="secondary">
                      {statusLabels[event.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{event.max_coordinators || '—'}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/events/${event.id}`}>
                        <Button variant="ghost" size="icon-sm" title="Просмотр">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <EventFormDialog mode="edit" event={event} />
                      <form
                        action={async () => {
                          'use server'
                          await deleteEventAction(event.id)
                        }}
                      >
                        <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" title="Удалить">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
