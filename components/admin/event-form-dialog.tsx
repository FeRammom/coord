'use client'

import { useState, useActionState } from 'react'
import { createEventAction, updateEventAction } from '@/app/actions/events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Pencil } from 'lucide-react'
import type { Event } from '@/lib/types'

interface EventFormDialogProps {
  mode: 'create' | 'edit'
  event?: Event
}

export function EventFormDialog({ mode, event }: EventFormDialogProps) {
  const [open, setOpen] = useState(false)
  const action = mode === 'create' ? createEventAction : updateEventAction

  const [state, formAction, isPending] = useActionState(async (prev: { error?: string; success?: string } | null, formData: FormData) => {
    const result = await action(prev, formData)
    if (result?.success) {
      setOpen(false)
    }
    return result
  }, null)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === 'create' ? (
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Добавить
          </Button>
        ) : (
          <Button variant="ghost" size="icon-sm" title="Редактировать">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Новое мероприятие' : 'Редактировать мероприятие'}
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          {mode === 'edit' && <input type="hidden" name="id" value={event?.id} />}
          {state?.error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Название *</Label>
            <Input id="title" name="title" defaultValue={event?.title} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea id="description" name="description" defaultValue={event?.description || ''} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="event_date">Дата</Label>
              <Input id="event_date" name="event_date" type="date" defaultValue={event?.event_date || ''} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="max_coordinators">Макс. координаторов</Label>
              <Input id="max_coordinators" name="max_coordinators" type="number" min="1" defaultValue={event?.max_coordinators || ''} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="location">Место проведения</Label>
            <Input id="location" name="location" defaultValue={event?.location || ''} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Статус</Label>
            <Select name="status" defaultValue={event?.status || 'planned'}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Планируется</SelectItem>
                <SelectItem value="active">Активно</SelectItem>
                <SelectItem value="completed">Завершено</SelectItem>
                <SelectItem value="cancelled">Отменено</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Сохранение...' : mode === 'create' ? 'Создать' : 'Сохранить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
