'use client'

import { useState, useActionState } from 'react'
import { createAdminAction, updateAdminAction } from '@/app/actions/admins'
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
import { Plus, Pencil } from 'lucide-react'
import type { User } from '@/lib/types'

interface AdminFormDialogProps {
  mode: 'create' | 'edit'
  admin?: User
}

export function AdminFormDialog({ mode, admin }: AdminFormDialogProps) {
  const [open, setOpen] = useState(false)
  const action = mode === 'create' ? createAdminAction : updateAdminAction

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
            {mode === 'create' ? 'Новый администратор' : 'Редактировать администратора'}
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          {mode === 'edit' && <input type="hidden" name="id" value={admin?.id} />}
          {state?.error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="full_name">ФИО *</Label>
            <Input id="full_name" name="full_name" defaultValue={admin?.full_name} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="login">Логин *</Label>
            <Input id="login" name="login" defaultValue={admin?.login} required />
          </div>
          {mode === 'create' ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Пароль *</Label>
              <Input id="password" name="password" type="password" required />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Label htmlFor="new_password">Новый пароль (оставьте пустым, чтобы не менять)</Label>
              <Input id="new_password" name="new_password" type="password" />
            </div>
          )}
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
