import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './mocks/server'
import { useToastStore } from '@/stores/toastStore'

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
