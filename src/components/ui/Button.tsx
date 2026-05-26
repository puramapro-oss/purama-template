'use client'
import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--primary)] text-white hover:opacity-90 active:scale-[0.98] shadow-[0_0_20px_color-mix(in_srgb,var(--primary)_30%,transparent)]',
        secondary:
          'bg-[rgba(255,255,255,0.08)] text-[var(--foreground)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.12)] active:scale-[0.98]',
        ghost:
          'text-[var(--foreground)] hover:bg-[rgba(255,255,255,0.06)] active:scale-[0.98]',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]',
        outline:
          'border border-[rgba(255,255,255,0.12)] text-[var(--foreground)] hover:bg-[rgba(255,255,255,0.06)] active:scale-[0.98]',
        gradient:
          'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white hover:opacity-90 active:scale-[0.98] shadow-[0_0_30px_color-mix(in_srgb,var(--primary)_25%,transparent)]',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-5',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export { Button, buttonVariants }
export default Button
