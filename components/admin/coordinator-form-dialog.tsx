'use client'

import { useState, useActionState } from 'react'
import { createCoordinatorAction, updateCoordinatorAction } from '@/app/actions/coordinators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Pencil, Copy, Check } from 'lucide-react'
import type { User } from '@/lib/types'

interface CoordinatorFormDialogProps {
  mode: 'create' | 'edit'
  coordinator?: User
}

export function CoordinatorFormDialog({ mode, coordinator }: CoordinatorFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [credentials, setCredentials] = useState<{ login: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const [state, formAction, isPending] = useActionState(async (prev: { error?: string; success?: string; login?: string; password?: string } | null, formData: FormData) => {
    if (mode === 'create') {
      const result = await createCoordinatorAction(prev, formData)
      if (result?.success && result.login && result.password) {
        setCredentials({ login: result.login, password: result.password })
      }
      return result
    } else {
      const result = await updateCoordinatorAction(prev, formData)
      if (result?.success) {
        setOpen(false)
      }
      return result
    }
  }, null)

  const handleCopy = () => {
    if (credentials) {
      navigator.clipboard.writeText(`Логин: ${credentials.login}\nПароль: ${credentials.password}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setCredentials(null)
      setCopied(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
            {credentials
              ? 'Координатор создан'
              : mode === 'create'
              ? 'Новый координатор'
              : 'Редактировать координатора'}
          </DialogTitle>
        </DialogHeader>

        {credentials ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Логин и пароль сгенерированы автоматически. Сохраните их и передайте координатору.
            </p>
            <div className="rounded-lg border bg-muted/50 p-4 font-mono text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p>{'Логин: '}<span className="font-semibold text-foreground">{credentials.login}</span></p>
                  <p>{'Пароль: '}<span className="font-semibold text-foreground">{credentials.password}</span></p>
                </div>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Скопировано' : 'Копировать'}
                </Button>
              </div>
            </div>
            <Button onClick={() => handleClose(false)}>Закрыть</Button>
          </div>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            {mode === 'edit' && <input type="hidden" name="id" value={coordinator?.id} />}
            {state?.error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.error}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="full_name">{'ФИО *'}</Label>
              <Input id="full_name" name="full_name" defaultValue={coordinator?.full_name} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="direction">Направление</Label>
              <Input id="direction" name="direction" defaultValue={coordinator?.direction || ''} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="group_name">Группа</Label>
              <Input id="group_name" name="group_name" defaultValue={coordinator?.group_name || ''} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input id="phone" name="phone" defaultValue={coordinator?.phone || ''} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="residence">Место проживания</Label>
              <Input id="residence" name="residence" defaultValue={coordinator?.residence || ''} />
            </div>
            {mode === 'edit' && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="new_password">Новый пароль (оставьте пустым, чтобы не менять)</Label>
                <Input id="new_password" name="new_password" type="password" />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Сохранение...' : mode === 'create' ? 'Создать' : 'Сохранить'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
