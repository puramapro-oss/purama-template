import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface ErrorStateProps {
  title?: string
  message: string
  retry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Une erreur est survenue',
  message,
  retry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
        <AlertCircle className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-[var(--foreground)]">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-[rgba(245,245,250,0.6)]">{message}</p>
      {retry && (
        <Button onClick={retry} variant="secondary">
          Réessayer
        </Button>
      )}
    </div>
  )
}
