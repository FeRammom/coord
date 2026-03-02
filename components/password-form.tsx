'use client'

import { useActionState } from 'react'
import { changePasswordAction } from '@/app/actions/password'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function PasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, null)

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Сменить пароль</CardTitle>
        <CardDescription>Введите текущий и новый пароль</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          {state?.error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}
          {state?.success && (
            <div className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
              {state.success}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="currentPassword">Текущий пароль</Label>
            <Input id="currentPassword" name="currentPassword" type="password" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="newPassword">Новый пароль</Label>
            <Input id="newPassword" name="newPassword" type="password" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
