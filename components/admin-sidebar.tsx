'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MessageSquareText,
  BarChart3,
  LogOut,
  KeyRound,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { logoutAction } from '@/app/actions/auth'
import type { SessionPayload } from '@/lib/auth'

const navItems = [
  { title: 'Главная', href: '/admin', icon: LayoutDashboard },
  { title: 'Мероприятия', href: '/admin/events', icon: CalendarDays },
  { title: 'Координаторы', href: '/admin/coordinators', icon: Users },
  { title: 'Формы обратной связи', href: '/admin/feedback', icon: MessageSquareText },
  { title: 'Статистика', href: '/admin/stats', icon: BarChart3 },
]

export function AdminSidebar({ session }: { session: SessionPayload }) {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Users className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">Координаторы</span>
            <span className="text-xs text-muted-foreground">Панель управления</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Навигация</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Настройки</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Сменить пароль">
                  <Link href="/admin/password">
                    <KeyRound />
                    <span>Сменить пароль</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            {session.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">{session.fullName}</span>
            <span className="truncate text-xs text-muted-foreground">Администратор</span>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              title="Выйти"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Выйти</span>
            </button>
          </form>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
