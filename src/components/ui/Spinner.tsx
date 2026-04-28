import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
}

export function Spinner({ size = 'md', className, label = 'Carregando' }: SpinnerProps) {
  return (
    <div role="status" aria-live="polite" className="inline-flex items-center gap-2">
      <Loader2 className={cn('animate-spin text-[var(--color-primary)]', sizeClasses[size], className)} />
      <span className="sr-only">{label}</span>
    </div>
  )
}
