import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type BadgeVariant = 'default' | 'primary' | 'success' | 'destructive' | 'outline'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]',
  primary: 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]',
  success: 'bg-[var(--color-success)]/15 text-[var(--color-success)]',
  destructive: 'bg-[var(--color-destructive)]/15 text-[var(--color-destructive)]',
  outline: 'border border-[var(--color-border)] bg-transparent text-[var(--color-foreground)]',
}

export function Badge({ className, variant = 'default', ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
      {...rest}
    />
  )
}
