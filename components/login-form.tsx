'use client'

import { useActionState } from 'react'
import { loginAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <Card className="border-border/60 shadow-lg">
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4 pt-6">
          {state?.error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="login">Логин</Label>
            <Input
              id="login"
              name="login"
              placeholder="Введите логин"
              required
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Введите пароль"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Вход...' : 'Войти'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
