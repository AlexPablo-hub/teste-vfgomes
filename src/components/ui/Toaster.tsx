import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, X, XCircle, type LucideIcon } from 'lucide-react'
import { useToastStore, type Toast, type ToastVariant } from '@/stores/toastStore'

interface VariantConfig {
  icon: LucideIcon
  /** Cor de destaque (border lateral, ícone, barra de progresso). */
  accent: string
  /** Background do "selo" do ícone (com leve transparência). */
  iconBg: string
}

const variantConfig: Record<ToastVariant, VariantConfig> = {
  info: {
    icon: Info,
    accent: '#a78bfa',
    iconBg: 'rgba(124,58,237,0.15)',
  },
  success: {
    icon: CheckCircle2,
    accent: '#34d399',
    iconBg: 'rgba(16,185,129,0.15)',
  },
  error: {
    icon: XCircle,
    accent: '#f87171',
    iconBg: 'rgba(239,68,68,0.15)',
  },
  warning: {
    icon: AlertTriangle,
    accent: '#fbbf24',
    iconBg: 'rgba(245,158,11,0.15)',
  },
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      role="region"
      aria-label="Notificações"
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-3 sm:bottom-6 sm:right-6"
    >
      <AnimatePresence initial={true}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  )
}

interface ToastItemProps {
  toast: Toast
}

function ToastItem({ toast }: ToastItemProps) {
  const remove = useToastStore((s) => s.remove)
  const config = variantConfig[toast.variant]
  const Icon = config.icon

  // Pausa a barra de progresso enquanto o usuário hover (animação visual).
  // O timer real do auto-dismiss vive no toastStore.
  const [paused, setPaused] = useState(false)

  return (
    <motion.div
      layout
      role="status"
      aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95, transition: { duration: 0.25 } }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-auto group relative flex w-full gap-3 overflow-hidden rounded-xl border bg-[rgba(15,23,42,0.95)] p-4 pb-5 shadow-2xl backdrop-blur-md"
      style={{
        borderColor: `${config.accent}33`,
        borderLeftWidth: 3,
        borderLeftColor: config.accent,
      }}
    >
      {/* Selo do ícone */}
      <div
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
        style={{ backgroundColor: config.iconBg }}
        aria-hidden
      >
        <Icon className="h-4 w-4" style={{ color: config.accent }} />
      </div>

      {/* Conteúdo */}
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-semibold leading-5 text-white">{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-xs leading-relaxed text-[var(--color-foreground-subtle)]">
            {toast.description}
          </p>
        )}
      </div>

      {/* Fechar */}
      <button
        type="button"
        onClick={() => remove(toast.id)}
        aria-label="Dispensar notificação"
        className="grid h-6 w-6 shrink-0 place-items-center rounded text-[var(--color-foreground-faint)] transition-colors hover:bg-white/5 hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Barra de progresso — anima width de 100% → 0% durante a duração */}
      {toast.duration > 0 && (
        <motion.div
          aria-hidden
          className="absolute bottom-0 left-0 h-1"
          style={{ backgroundColor: config.accent }}
          initial={{ width: '100%' }}
          animate={{ width: paused ? undefined : '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  )
}
