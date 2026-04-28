import { useToastStore, type ToastVariant } from '@/stores/toastStore'

const DEFAULT_DURATION = 5000

interface ToastOptions {
  description?: string
  /** Duração em ms. Use 0 para toast persistente. Default: 5000ms. */
  duration?: number
}

function show(variant: ToastVariant, title: string, options?: ToastOptions): string {
  return useToastStore.getState().add({
    variant,
    title,
    description: options?.description,
    duration: options?.duration ?? DEFAULT_DURATION,
  })
}

/**
 * API de toasts NOIR_LUXE.
 *
 * @example
 *   toast.info('Funcionalidade em desenvolvimento')
 *   toast.success('Pedido confirmado', { description: 'Verifique seu email.' })
 *   toast.error('Falha no login', { duration: 0 })
 *   toast.dismiss(id)
 */
export const toast = {
  info: (title: string, options?: ToastOptions) => show('info', title, options),
  success: (title: string, options?: ToastOptions) => show('success', title, options),
  error: (title: string, options?: ToastOptions) => show('error', title, options),
  warning: (title: string, options?: ToastOptions) => show('warning', title, options),
  dismiss: (id: string) => useToastStore.getState().remove(id),
  clear: () => useToastStore.getState().clear(),
}
