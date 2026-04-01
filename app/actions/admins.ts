'use server'

import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'
import { requireSuperAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createAdminAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
) {
  await requireSuperAdmin()

  const login = formData.get('login') as string
  const password = formData.get('password') as string
  const full_name = formData.get('full_name') as string

  if (!login || !password || !full_name) {
    return { error: 'Заполните все обязательные поля' }
  }

  if (password.length < 4) {
    return { error: 'Пароль должен быть не менее 4 символов' }
  }

  const db = getDb()
  const existing = db.prepare('SELECT id FROM users WHERE login = ?').get(login)
  if (existing) {
    return { error: 'Пользователь с таким логином уже существует' }
  }

  const hash = bcrypt.hashSync(password, 10)
  db.prepare(`
    INSERT INTO users (login, password_hash, role, is_super, full_name)
    VALUES (?, ?, 'admin', 0, ?)
  `).run(login, hash, full_name)

  revalidatePath('/admin/admins')
  return { success: 'Младший администратор создан' }
}

export async function updateAdminAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
) {
  await requireSuperAdmin()

  const id = formData.get('id') as string
  const login = formData.get('login') as string
  const full_name = formData.get('full_name') as string
  const newPassword = formData.get('new_password') as string

  if (!full_name || !login) {
    return { error: 'Заполните обязательные поля' }
  }

  const db = getDb()
  
  // Проверяем, не занят ли логин другим пользователем
  const existingUser = db.prepare('SELECT id FROM users WHERE login = ? AND id != ?').get(login, parseInt(id)) as { id: number } | undefined
  if (existingUser) {
    return { error: 'Пользователь с таким логином уже существует' }
  }

  if (newPassword && newPassword.length > 0) {
    if (newPassword.length < 4) {
      return { error: 'Пароль должен быть не менее 4 символов' }
    }
    const hash = bcrypt.hashSync(newPassword, 10)
    db.prepare(`
      UPDATE users SET login = ?, full_name = ?, password_hash = ?
      WHERE id = ? AND role = 'admin' AND is_super = 0
    `).run(login, full_name, hash, parseInt(id))
  } else {
    db.prepare(`
      UPDATE users SET login = ?, full_name = ?
      WHERE id = ? AND role = 'admin' AND is_super = 0
    `).run(login, full_name, parseInt(id))
  }

  revalidatePath('/admin/admins')
  return { success: 'Администратор обновлён' }
}

export async function deleteAdminAction(id: number) {
  await requireSuperAdmin()
  const db = getDb()
  
  // Нельзя удалить главного админа
  const user = db.prepare('SELECT is_super FROM users WHERE id = ?').get(id) as { is_super: number } | undefined
  if (user?.is_super === 1) {
    return
  }
  
  db.prepare("DELETE FROM users WHERE id = ? AND role = 'admin' AND is_super = 0").run(id)
  revalidatePath('/admin/admins')
}
