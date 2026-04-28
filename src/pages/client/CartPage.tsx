import { Link } from 'react-router-dom'
import { ShoppingCart, ArrowLeft, Trash2 } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { CartItemRow } from '@/components/cart/CartItemRow'
import { CartSummary } from '@/components/cart/CartSummary'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'

export function CartPage() {
  const items = useCartStore((s) => s.items)
  const clear = useCartStore((s) => s.clear)
  const subtotal = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0)
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0)
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Carrinho</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            {totalItems > 0
              ? `${totalItems} ${totalItems === 1 ? 'item adicionado' : 'itens adicionados'}.`
              : 'Seu carrinho está vazio.'}
          </p>
        </div>
        {items.length > 0 && (
          <Button
            variant="ghost"
            onClick={() => setConfirmClearOpen(true)}
            className="text-[var(--color-destructive)]"
          >
            <Trash2 className="h-4 w-4" /> Limpar carrinho
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<ShoppingCart className="h-6 w-6" />}
            title="Seu carrinho está vazio"
            description="Adicione produtos do nosso catálogo para começar."
            action={
              <Link
                to="/products"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-foreground)] shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
              >
                <ArrowLeft className="h-4 w-4" />
                Ver produtos
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <CartItemRow key={item.product.id} item={item} />
            ))}
          </div>
          <div className="lg:sticky lg:top-20 lg:self-start">
            <CartSummary subtotal={subtotal} itemCount={totalItems} ctaTo="/checkout" />
            <Link
              to="/products"
              className="mt-3 inline-flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            >
              <ArrowLeft className="h-4 w-4" /> Continuar comprando
            </Link>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={clear}
        title="Limpar carrinho?"
        description="Todos os itens serão removidos do carrinho."
        destructive
        confirmLabel="Limpar"
      />
    </div>
  )
}
