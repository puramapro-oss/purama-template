import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--primary)] text-white',
        secondary: 'bg-[rgba(255,255,255,0.1)] text-[rgba(245,245,250,0.8)]',
        success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        destructive: 'bg-red-500/20 text-red-400 border border-red-500/30',
        gold: 'bg-amber-400/20 text-amber-300 border border-amber-400/30',
        outline: 'border border-[rgba(255,255,255,0.12)] text-[rgba(245,245,250,0.7)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
