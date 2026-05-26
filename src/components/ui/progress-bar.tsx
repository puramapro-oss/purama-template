import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  variant?: 'default' | 'gradient'
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  variant = 'default',
  className,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between text-sm">
          {label && <span className="text-[rgba(245,245,250,0.8)]">{label}</span>}
          {showValue && (
            <span className="text-[rgba(245,245,250,0.6)]">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            variant === 'gradient'
              ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]'
              : 'bg-[var(--primary)]'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
