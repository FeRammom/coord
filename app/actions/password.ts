'use server'

import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function changePasswordAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
) {
  const session = await getSession()
  if (!session) return { error: 'Не авторизован' }

  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'Заполните все поля' }
  }

  if (newPassword.length < 4) {
    return { error: 'Новый пароль должен быть не менее 4 символов' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Пароли не совпадают' }
  }

  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.id) as { password_hash: string } | undefined

  if (!user) return { error: 'Пользователь не найден' }

  const isValid = bcrypt.compareSync(currentPassword, user.password_hash)
  if (!isValid) return { error: 'Неверный текущий пароль' }

  const newHash = bcrypt.hashSync(newPassword, 10)
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, session.id)

  revalidatePath(session.role === 'admin' ? '/admin/password' : '/dashboard/password')
  return { success: 'Пароль успешно изменён' }
}
