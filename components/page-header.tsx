import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-4 border-b bg-card px-6 py-4', className)}>
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <div className="flex flex-1 items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {children && <div className="flex items-center gap-2">{children}</div>}
        </div>
      </div>
    </header>
  )
}
