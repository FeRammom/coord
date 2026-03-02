'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'
import { createSession } from '@/lib/auth'
import type { User } from '@/lib/types'

export async function loginAction(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const login = formData.get('login') as string
  const password = formData.get('password') as string

  if (!login || !password) {
    return { error: 'Введите логин и пароль' }
  }

  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE login = ?').get(login) as User | undefined

  if (!user) {
    return { error: 'Неверный логин или пароль' }
  }

  const isValid = bcrypt.compareSync(password, user.password_hash)
  if (!isValid) {
    return { error: 'Неверный логин или пароль' }
  }

  const token = await createSession({
    id: user.id,
    login: user.login,
    role: user.role,
    fullName: user.full_name,
  })

  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })

  if (user.role === 'admin') {
    redirect('/admin')
  } else {
    redirect('/dashboard')
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  redirect('/login')
}
