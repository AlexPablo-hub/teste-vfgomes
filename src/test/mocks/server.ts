import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** Servidor MSW em ambiente Node (Vitest). Inicializado no setup global. */
export const server = setupServer(...handlers)
