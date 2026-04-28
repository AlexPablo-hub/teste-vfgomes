import { Minus, Plus, Trash2 } from 'lucide-react'
import type { CartItem } from '@/types/cart'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/stores/cartStore'
import { formatBRL } from '@/lib/format'

interface CartItemRowProps {
  item: CartItem
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { increment, decrement, remove, setQuantity } = useCartStore.getState()
  const subtotal = item.product.price * item.quantity

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:flex-row sm:items-center animate-fade-in">
      <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-white">
        <img
          src={item.product.image}
          alt={item.product.title}
          loading="lazy"
          className="h-full w-full object-contain p-2"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium">{item.product.title}</p>
        <p className="mt-1 text-xs capitalize text-[var(--color-muted-foreground)]">{item.product.category}</p>
        <p className="mt-1 text-sm font-semibold">{formatBRL(item.product.price)}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-lg border border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => decrement(item.product.id)}
            aria-label={`Diminuir quantidade de ${item.product.title}`}
            className="grid h-9 w-9 place-items-center rounded-l-lg hover:bg-[var(--color-muted)]"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10)
              if (!Number.isNaN(v)) setQuantity(item.product.id, v)
            }}
            aria-label={`Quantidade de ${item.product.title}`}
            className="h-9 w-12 border-x border-[var(--color-border)] bg-transparent text-center text-sm focus:outline-none"
          />
          <button
            type="button"
            onClick={() => increment(item.product.id)}
            aria-label={`Aumentar quantidade de ${item.product.title}`}
            className="grid h-9 w-9 place-items-center rounded-r-lg hover:bg-[var(--color-muted)]"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="ml-auto sm:ml-0 sm:w-28 sm:text-right">
          <p className="text-xs text-[var(--color-muted-foreground)]">Subtotal</p>
          <p className="font-semibold">{formatBRL(subtotal)}</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => remove(item.product.id)}
          aria-label={`Remover ${item.product.title} do carrinho`}
          className="text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
