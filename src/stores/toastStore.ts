import { create } from 'zustand'

export type ToastVariant = 'info' | 'success' | 'error' | 'warning'

export interface Toast {
  id: string
  variant: ToastVariant
  title: string
  description?: string
  /** Duração em ms até auto-dismiss. 0 = persistente (precisa fechar manual). */
  duration: number
}

interface ToastState {
  toasts: Toast[]
  add: (toast: Omit<Toast, 'id'>) => string
  remove: (id: string) => void
  clear: () => void
}

const timers = new Map<string, ReturnType<typeof setTimeout>>()

function nextId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  add: (toast) => {
    const id = nextId()
    const next: Toast = { id, ...toast }
    set((s) => ({ toasts: [...s.toasts, next] }))

    if (next.duration > 0) {
      const timer = setTimeout(() => get().remove(id), next.duration)
      timers.set(id, timer)
    }
    return id
  },
  remove: (id) => {
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
  clear: () => {
    timers.forEach((t) => clearTimeout(t))
    timers.clear()
    set({ toasts: [] })
  },
}))
