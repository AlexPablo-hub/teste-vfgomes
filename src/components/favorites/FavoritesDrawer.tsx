import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useCartStore } from '@/stores/cartStore'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatBRL } from '@/lib/format'
import { easeLuxe } from '@/lib/motion'
import { toast } from '@/lib/toast'

interface FavoritesDrawerProps {
  open: boolean
  onClose: () => void
}

export function FavoritesDrawer({ open, onClose }: FavoritesDrawerProps) {
  const items = useFavoritesStore((s) => s.items)
  const remove = useFavoritesStore((s) => s.remove)
  const addToCart = useCartStore((s) => s.add)

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
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Favoritos">
      <div
        className="absolute inset-0 bg-[rgba(2,6,23,0.4)] backdrop-blur-[6px] animate-fade-in"
        onClick={onClose}
        aria-hidden
      />

      <div
        className="absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col border-l border-white/10 bg-[#0f172a] animate-slide-in-right"
        style={{ filter: 'drop-shadow(4px 0px 12px rgba(0,0,0,0.5))' }}
      >
        <header className="flex items-center justify-between border-b border-white/10 bg-[rgba(2,6,23,0.5)] px-8 py-8">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-[#a78bfa]" />
            <h2 className="text-xl font-normal leading-7 text-white">Seus Favoritos</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar favoritos"
            className="rounded-md p-2 text-[#94a3b8] hover:bg-white/5 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex-1 p-8">
            <EmptyState
              icon={<Heart className="h-6 w-6" />}
              title="Nenhum favorito ainda"
              description="Toque no coração nos cards para guardá-los aqui."
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
          <ul className="flex-1 overflow-y-auto px-8 py-6">
            <AnimatePresence initial={true}>
              {items.map((product, i) => (
                <motion.li
                  key={product.id}
                  layout
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.5, ease: easeLuxe }}
                  className="mb-6 flex gap-4 last:mb-0"
                >
                  <Link
                    to={`/products/${product.id}`}
                    onClick={onClose}
                    className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/5 bg-white"
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      loading="lazy"
                      className="h-full w-full object-contain p-2"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/products/${product.id}`}
                          onClick={onClose}
                          className="line-clamp-2 text-sm font-semibold leading-5 text-white hover:text-[#a78bfa]"
                        >
                          {product.title}
                        </Link>
                        <button
                          type="button"
                          onClick={() => remove(product.id)}
                          aria-label={`Remover ${product.title} dos favoritos`}
                          className="shrink-0 rounded p-1 text-[#94a3b8] hover:text-[#f87171]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="mt-1 text-base font-bold text-white">
                        {formatBRL(product.price)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        addToCart(product, 1)
                        toast.success('Adicionado ao carrinho.')
                      }}
                      className="inline-flex h-9 w-fit items-center gap-2 rounded-lg bg-[#7c3aed] px-3 text-xs font-semibold uppercase tracking-[1px] text-white transition-all hover:bg-[#6d28d9] active:scale-[0.98]"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      Mover ao carrinho
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>,
    document.body,
  )
}
