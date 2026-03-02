'use server'

import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

function generateLogin(fullName: string): string {
  const translitMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  }

  const base = fullName
    .toLowerCase()
    .split('')
    .map((ch) => translitMap[ch] || ch)
    .join('')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 12)

  return base + Math.floor(100 + Math.random() * 900)
}

function generatePassword(length = 8): string {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export async function createCoordinatorAction(
  _prevState: { error?: string; success?: string; login?: string; password?: string } | null,
  formData: FormData
) {
  await requireAdmin()

  const full_name = formData.get('full_name') as string
  const direction = formData.get('direction') as string
  const group_name = formData.get('group_name') as string
  const phone = formData.get('phone') as string
  const residence = formData.get('residence') as string

  if (!full_name) {
    return { error: 'Введите ФИО' }
  }

  const db = getDb()

  // Auto-generate login and password
  let login = generateLogin(full_name)
  // Ensure login is unique
  let existing = db.prepare('SELECT id FROM users WHERE login = ?').get(login)
  while (existing) {
    login = generateLogin(full_name)
    existing = db.prepare('SELECT id FROM users WHERE login = ?').get(login)
  }

  const password = generatePassword()
  const hash = bcrypt.hashSync(password, 10)

  db.prepare(`
    INSERT INTO users (login, password_hash, role, full_name, direction, group_name, phone, residence)
    VALUES (?, ?, 'coordinator', ?, ?, ?, ?, ?)
  `).run(login, hash, full_name, direction || '', group_name || '', phone || '', residence || '')

  revalidatePath('/admin/coordinators')
  return { success: 'Координатор создан', login, password }
}

export async function updateCoordinatorAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
) {
  await requireAdmin()

  const id = formData.get('id') as string
  const full_name = formData.get('full_name') as string
  const direction = formData.get('direction') as string
  const group_name = formData.get('group_name') as string
  const phone = formData.get('phone') as string
  const residence = formData.get('residence') as string
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
      UPDATE users SET full_name = ?, direction = ?, group_name = ?, phone = ?, residence = ?, password_hash = ?
      WHERE id = ? AND role = 'coordinator'
    `).run(full_name, direction || '', group_name || '', phone || '', residence || '', hash, parseInt(id))
  } else {
    db.prepare(`
      UPDATE users SET full_name = ?, direction = ?, group_name = ?, phone = ?, residence = ?
      WHERE id = ? AND role = 'coordinator'
    `).run(full_name, direction || '', group_name || '', phone || '', residence || '', parseInt(id))
  }

  revalidatePath('/admin/coordinators')
  return { success: 'Координатор обновлён' }
}

export async function deleteCoordinatorAction(id: number) {
  await requireAdmin()
  const db = getDb()
  db.prepare('DELETE FROM feedback_responses WHERE user_id = ?').run(id)
  db.prepare('DELETE FROM ratings WHERE user_id = ?').run(id)
  db.prepare('DELETE FROM applications WHERE user_id = ?').run(id)
  db.prepare("DELETE FROM users WHERE id = ? AND role = 'coordinator'").run(id)
  revalidatePath('/admin/coordinators')
}

export async function importCoordinatorsFromExcelAction(coordinators: Array<{
  full_name: string
  direction: string
  group_name: string
  phone: string
  residence: string
}>) {
  await requireAdmin()
  const db = getDb()

  const results: Array<{ full_name: string; login: string; password: string }> = []

  for (const coord of coordinators) {
    if (!coord.full_name) continue

    let login = generateLogin(coord.full_name)
    let existing = db.prepare('SELECT id FROM users WHERE login = ?').get(login)
    while (existing) {
      login = generateLogin(coord.full_name)
      existing = db.prepare('SELECT id FROM users WHERE login = ?').get(login)
    }

    const password = generatePassword()
    const hash = bcrypt.hashSync(password, 10)

    db.prepare(`
      INSERT INTO users (login, password_hash, role, full_name, direction, group_name, phone, residence)
      VALUES (?, ?, 'coordinator', ?, ?, ?, ?, ?)
    `).run(login, hash, coord.full_name, coord.direction || '', coord.group_name || '', coord.phone || '', coord.residence || '')

    results.push({ full_name: coord.full_name, login, password })
  }

  revalidatePath('/admin/coordinators')
  return { success: true, imported: results }
}
