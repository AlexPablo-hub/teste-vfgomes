import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './mocks/server'
import { useToastStore } from '@/stores/toastStore'

// jsdom não implementa IntersectionObserver — usado pelo useInfiniteScroll
// nas páginas admin. Stub mínimo: registra mas nunca dispara automaticamente,
// evitando ReferenceError na construção dos componentes.
class IntersectionObserverStub {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
  root = null
  rootMargin = ''
  thresholds = []
}
globalThis.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver

// MSW lifecycle: liga antes de tudo, reseta entre testes, desliga no fim.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  // Limpa LocalStorage entre testes para isolar estado de stores Zustand persist.
  window.localStorage.clear()
  // Limpa toasts pendentes (store em memória não some entre testes).
  useToastStore.getState().clear()
})
afterAll(() => server.close())
