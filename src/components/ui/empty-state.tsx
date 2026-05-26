import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(255,255,255,0.04)]">
          <Icon className="h-8 w-8 text-[rgba(245,245,250,0.4)]" />
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-[var(--foreground)]">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-[rgba(245,245,250,0.6)]">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="secondary">
          {action.label}
        </Button>
      )}
    </div>
  )
}
