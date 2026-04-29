import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatBRL } from '@/lib/format'

interface CartSummaryProps {
  subtotal: number
  shipping?: number
  itemCount: number
  ctaTo?: string
  ctaLabel?: string
  onCheckout?: () => void
  disabled?: boolean
  /** Esconde o botão de CTA — útil quando o pai já tem seu próprio submit. */
  hideCta?: boolean
}

export function CartSummary({
  subtotal,
  shipping = subtotal > 200 ? 0 : 19.9,
  itemCount,
  ctaTo,
  ctaLabel = 'Finalizar compra',
  onCheckout,
  disabled,
  hideCta,
}: CartSummaryProps) {
  const total = subtotal + (subtotal > 0 ? shipping : 0)
  const isDisabled = disabled || itemCount === 0

  return (
    <aside className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Resumo</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-[var(--color-muted-foreground)]">
            {itemCount} {itemCount === 1 ? 'item' : 'itens'}
          </dt>
          <dd className="font-medium">{formatBRL(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[var(--color-muted-foreground)]">Frete</dt>
          <dd className="font-medium">
            {subtotal === 0 ? '—' : shipping === 0 ? 'Grátis' : formatBRL(shipping)}
          </dd>
        </div>
        {subtotal > 0 && shipping === 0 && (
          <p className="rounded-md bg-[var(--color-success)]/15 px-2 py-1.5 text-xs text-[var(--color-success)]">
            Você ganhou frete grátis 
          </p>
        )}
        <div className="border-t border-[var(--color-border)] pt-3">
          <div className="flex items-baseline justify-between">
            <dt className="text-base font-semibold">Total</dt>
            <dd className="text-xl font-bold">{formatBRL(total)}</dd>
          </div>
        </div>
      </dl>

      {hideCta ? null : ctaTo && !isDisabled ? (
        <Link
          to={ctaTo}
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 text-base font-medium text-[var(--color-primary-foreground)] shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <Button onClick={onCheckout} size="lg" className="mt-5 w-full" disabled={isDisabled} variant="primary">
          {ctaLabel} <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </aside>
  )
}
