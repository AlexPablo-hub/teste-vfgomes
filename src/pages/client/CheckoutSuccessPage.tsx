import { Link, Navigate, useLocation } from 'react-router-dom'
import { CheckCircle2, Printer, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatBRL } from '@/lib/format'
import type { CartItem } from '@/types/cart'
import { easeLuxe, fadeIn, scaleIn, slideUp, staggerContainer, staggerItem } from '@/lib/motion'

interface SuccessState {
  orderId: string
  estimatedDelivery: string
  items: CartItem[]
  subtotal: number
  shipping: number
  total: number
}

export function CheckoutSuccessPage() {
  const location = useLocation()
  const state = location.state as SuccessState | null

  if (!state) return <Navigate to="/products" replace />

  const handlePrint = () => window.print()

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-12">
      {/* Header simplificado — apenas wordmark centralizado */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="mb-10 text-center"
      >
        <span className="brand-wordmark text-2xl font-semibold">NOIR · LUXE</span>
      </motion.div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Bloco principal */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{
              scale: 1,
              rotate: 0,
              boxShadow: [
                '0 0 0 0 rgba(124,58,237,0.55)',
                '0 0 0 20px rgba(124,58,237,0)',
                '0 0 0 0 rgba(124,58,237,0)',
              ],
            }}
            transition={{
              scale: { delay: 0.6, duration: 1.0, ease: easeLuxe },
              rotate: { delay: 0.6, duration: 1.0, ease: easeLuxe },
              boxShadow: { delay: 1.6, duration: 2.0, repeat: 1 },
            }}
            className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--color-primary)]/15 ring-8 ring-[var(--color-primary)]/5"
          >
            <CheckCircle2 className="h-8 w-8 text-[var(--color-primary)]" />
          </motion.div>
          <h1 className="mt-5 text-3xl font-bold sm:text-4xl">Pedido realizado com sucesso!</h1>
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            Obrigado por escolher a NOIR_LUXE. Sua curadoria está sendo processada.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
              <p className="label-caps text-[var(--color-muted-foreground)]">Número do Pedido</p>
              <p className="mt-1 font-bold text-[var(--color-primary)]">{state.orderId}</p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
              <p className="label-caps text-[var(--color-muted-foreground)]">Previsão de Entrega</p>
              <p className="mt-1 font-bold">{state.estimatedDelivery}</p>
            </div>
          </div>
        </motion.div>

        {/* Resumo */}
        <motion.div
          variants={slideUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-8"
        >
          <h2 className="text-2xl font-semibold">Resumo do Pedido</h2>

          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            transition={{ delayChildren: 0.5 }}
            className="mt-6 divide-y divide-[var(--color-border)]"
          >
            {state.items.map((item) => (
              <motion.li
                key={item.product.id}
                variants={staggerItem}
                className="flex items-center gap-4 py-4"
              >
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/5">
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="h-full w-full object-contain p-2"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.product.title}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    Edição NOIR_LUXE · Qtd: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatBRL(item.product.price * item.quantity)}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">Qtd: {item.quantity}</p>
                </div>
              </motion.li>
            ))}
          </motion.ul>

          <dl className="mt-4 space-y-2 border-t border-[var(--color-border)] pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--color-muted-foreground)]">Subtotal</dt>
              <dd>{formatBRL(state.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-muted-foreground)]">Frete (Express)</dt>
              <dd className="text-[var(--color-success)]">Grátis</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-[var(--color-border)] pt-3">
              <dt className="text-base font-semibold">Total</dt>
              <dd className="text-2xl font-bold text-[var(--color-primary)]">{formatBRL(state.total)}</dd>
            </div>
          </dl>
        </motion.div>

        {/* Ações */}
        <motion.div
          variants={slideUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
          className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          <Link
            to="/products"
            replace
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[var(--color-primary)] text-sm font-semibold uppercase tracking-wider text-[var(--color-primary-foreground)] transition-all hover:opacity-90 active:scale-[0.99]"
          >
            <ShoppingBag className="h-4 w-4" /> Voltar para a Loja
          </Link>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[var(--color-border)] text-sm font-semibold uppercase tracking-wider transition-all hover:bg-[var(--color-muted)] active:scale-[0.99]"
          >
            <Printer className="h-4 w-4" /> Imprimir Comprovante
          </button>
        </motion.div>
      </div>
    </div>
  )
}
