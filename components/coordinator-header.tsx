'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, FileText, LogOut, KeyRound, ClipboardList } from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import type { SessionPayload } from '@/lib/auth'
import { cn } from '@/lib/utils'

const navItems = [
  { title: 'Мероприятия', href: '/dashboard', icon: CalendarDays },
  { title: 'Мои заявки', href: '/dashboard/applications', icon: ClipboardList },
  { title: 'Обратная связь', href: '/dashboard/feedback', icon: FileText },
]

export function CoordinatorHeader({ session }: { session: SessionPayload }) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-14 items-center gap-4 px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
          </div>
          <span className="hidden text-sm font-semibold sm:inline-block">
            Координаторы
          </span>
        </Link>
        <nav className="flex flex-1 items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline-block">{item.title}</span>
              </Link>
            )
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/password"
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            title="Сменить пароль"
          >
            <KeyRound className="h-4 w-4" />
          </Link>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            {session.fullName.charAt(0).toUpperCase()}
          </div>
          <span className="hidden text-sm font-medium md:inline-block">{session.fullName}</span>
          <form action={logoutAction}>
            <Button variant="ghost" size="icon-sm" title="Выйти">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Выйти</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
