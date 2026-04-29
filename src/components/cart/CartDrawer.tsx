import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Lock, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/stores/cartStore'
import { categoryLabels, type CategorySlug } from '@/data/mocks'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatBRL } from '@/lib/format'
import { easeLuxe } from '@/lib/motion'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartStore((s) => s.items)
  const remove = useCartStore((s) => s.remove)
  const increment = useCartStore((s) => s.increment)
  const decrement = useCartStore((s) => s.decrement)

  const subtotal = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0)
  const total = subtotal // Envio Premium grátis

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Carrinho">
      <div
        className="absolute inset-0 bg-[rgba(2,6,23,0.4)] backdrop-blur-[6px] animate-fade-in"
        onClick={onClose}
        aria-hidden
      />

      <div
        className="absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col border-l border-white/10 bg-[#0f172a] animate-slide-in-right"
        style={{ filter: 'drop-shadow(4px 0px 12px rgba(0,0,0,0.5))' }}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 bg-[rgba(2,6,23,0.5)] px-8 py-8">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-white" />
            <h2 className="text-xl font-normal leading-7 text-white">Seu Carrinho</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar carrinho"
            className="rounded-md p-2 text-[#94a3b8] hover:bg-white/5 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </header>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex-1 p-8">
            <EmptyState
              icon={<ShoppingBag className="h-6 w-6" />}
              title="Seu carrinho está vazio"
              description="Explore o catálogo NOIR LUXE para começar."
              action={
                <Link
                  to="/products"
                  onClick={onClose}
                  className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#7c3aed] px-6 text-sm font-semibold uppercase tracking-[1.6px] text-white hover:bg-[#6d28d9]"
                >
                  Ver Catálogo
                </Link>
              }
            />
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-8 py-6">
              <AnimatePresence initial={true}>
                {items.map((item, i) => (
                  <motion.li
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                    transition={{ delay: i * 0.15, duration: 0.8, ease: easeLuxe }}
                    className="mb-6 flex gap-4 last:mb-0"
                  >
                  <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/5 bg-[#2e3447]">
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-1 text-base font-semibold leading-6 text-white">
                          {item.product.title}
                        </p>
                        <button
                          type="button"
                          onClick={() => remove(item.product.id)}
                          aria-label={`Remover ${item.product.title}`}
                          className="rounded p-1 text-[#94a3b8] hover:text-[#f87171]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-xs uppercase tracking-wider text-[#64748b]">
                        {(categoryLabels as Record<string, string>)[
                          item.product.category as CategorySlug
                        ] ?? 'EDIÇÃO NOIR LUXE'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-0 rounded-full border border-white/10 bg-[#020617] px-2 py-1.5">
                        <button
                          type="button"
                          onClick={() => decrement(item.product.id)}
                          aria-label="Diminuir quantidade"
                          className="grid h-6 w-6 place-items-center text-[#94a3b8] hover:text-white"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => increment(item.product.id)}
                          aria-label="Aumentar quantidade"
                          className="grid h-6 w-6 place-items-center text-[#94a3b8] hover:text-white"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-white">
                        {formatBRL(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            {/* Footer / Totals */}
            <footer className="border-t border-white/10 bg-[rgba(2,6,23,0.8)] px-8 py-8 backdrop-blur-[6px]">
              <dl className="space-y-3">
                <div className="flex items-center justify-between text-base text-[#94a3b8]">
                  <dt>Subtotal</dt>
                  <dd>{formatBRL(subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between text-base">
                  <dt className="text-[#94a3b8]">Envio Premium</dt>
                  <dd className="text-[#7c3aed]">Grátis</dd>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <dt className="text-lg leading-7 text-white">Total</dt>
                  <dd className="flex flex-col items-end">
                    <span className="text-2xl font-normal leading-8 text-white">
                      {formatBRL(total)}
                    </span>
                    <span className="text-[10px] uppercase tracking-[1px] text-[#64748b]">
                      OU 10X DE {formatBRL(total / 10)}
                    </span>
                  </dd>
                </div>
              </dl>

              <Link
                to="/checkout"
                onClick={onClose}
                className="mt-6 flex h-16 w-full items-center justify-center rounded-lg bg-[#7c3aed] text-base font-bold uppercase tracking-[1.6px] text-white transition-all hover:bg-[#6d28d9] active:scale-[0.99]"
                style={{
                  boxShadow: '0px 10px 15px -3px rgba(124,58,237,0.2), 0px 4px 6px -4px rgba(124,58,237,0.2)',
                }}
              >
                FINALIZAR COMPRA
              </Link>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[-0.5px] text-[#475569]">
                <Lock className="h-2.5 w-2.5" />
                CHECKOUT SEGURO & ENCRIPTADO
              </p>
            </footer>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
