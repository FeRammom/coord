import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function Home() {
  const session = await getSession()
  if (session) {
    if (session.role === 'admin') redirect('/admin')
    redirect('/dashboard')
  }
  redirect('/login')
}
