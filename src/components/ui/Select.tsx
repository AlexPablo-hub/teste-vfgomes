import { forwardRef, useId, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...rest }, ref) => {
    const reactId = useId()
    const selectId = id ?? reactId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-[var(--color-foreground)]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error}
          className={cn(
            'h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input)] px-3 text-sm',
            'transition-colors',
            'focus:border-[var(--color-ring)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]/30',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-[var(--color-destructive)]' : '',
            className,
          )}
          {...rest}
        >
          {children}
        </select>
        {error && <p className="text-xs text-[var(--color-destructive)]">{error}</p>}
      </div>
    )
  },
)
Select.displayName = 'Select'
