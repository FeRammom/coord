'use server'

import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createCoordinatorAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
) {
  await requireAdmin()

  const login = formData.get('login') as string
  const password = formData.get('password') as string
  const full_name = formData.get('full_name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const organization = formData.get('organization') as string

  if (!login || !password || !full_name) {
    return { error: 'Заполните обязательные поля (логин, пароль, ФИО)' }
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
    INSERT INTO users (login, password_hash, role, full_name, email, phone, organization)
    VALUES (?, ?, 'coordinator', ?, ?, ?, ?)
  `).run(login, hash, full_name, email || null, phone || null, organization || null)

  revalidatePath('/admin/coordinators')
  return { success: 'Координатор создан' }
}

export async function updateCoordinatorAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
) {
  await requireAdmin()

  const id = formData.get('id') as string
  const full_name = formData.get('full_name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const organization = formData.get('organization') as string
  const newPassword = formData.get('new_password') as string

  if (!full_name) {
    return { error: 'Введите ФИО' }
  }

  const db = getDb()

  if (newPassword && newPassword.length > 0) {
    if (newPassword.length < 4) {
      return { error: 'Пароль должен быть не менее 4 символов' }
    }
    const hash = bcrypt.hashSync(newPassword, 10)
    db.prepare(`
      UPDATE users SET full_name = ?, email = ?, phone = ?, organization = ?, password_hash = ?
      WHERE id = ? AND role = 'coordinator'
    `).run(full_name, email || null, phone || null, organization || null, hash, parseInt(id))
  } else {
    db.prepare(`
      UPDATE users SET full_name = ?, email = ?, phone = ?, organization = ?
      WHERE id = ? AND role = 'coordinator'
    `).run(full_name, email || null, phone || null, organization || null, parseInt(id))
  }

  revalidatePath('/admin/coordinators')
  return { success: 'Координатор обновлён' }
}

export async function deleteCoordinatorAction(id: number) {
  await requireAdmin()
  const db = getDb()
  db.prepare('DELETE FROM applications WHERE user_id = ?').run(id)
  db.prepare('DELETE FROM ratings WHERE user_id = ?').run(id)
  db.prepare('DELETE FROM feedback_responses WHERE user_id = ?').run(id)
  db.prepare("DELETE FROM users WHERE id = ? AND role = 'coordinator'").run(id)
  revalidatePath('/admin/coordinators')
}
