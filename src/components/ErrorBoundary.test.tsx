import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'

// Componente que sempre lança — tipado como retornando null para satisfazer
// JSX (TS infere `void` em throw-only e isso não é ReactNode válido).
function Boom({ message = 'algo quebrou' }: { message?: string }): null {
  throw new Error(message)
}

describe('ErrorBoundary', () => {
  // Silencia o ruído do React reportando o erro nos testes — esperado nesse cenário.
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>
  beforeAll(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })
  afterAll(() => {
    consoleErrorSpy.mockRestore()
  })

  it('renderiza children normalmente quando não há erro', () => {
    render(
      <ErrorBoundary>
        <p>conteúdo ok</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('conteúdo ok')).toBeInTheDocument()
  })

  it('exibe fallback default quando filho lança erro', () => {
    render(
      <ErrorBoundary>
        <Boom message="bug crítico" />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('heading', { name: /algo deu errado/i })).toBeInTheDocument()
    expect(screen.getByText(/bug crítico/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /recarregar p[áa]gina/i })).toBeInTheDocument()
  })

  it('aceita fallback customizado via prop', () => {
    render(
      <ErrorBoundary fallback={<p>fallback custom</p>}>
        <Boom />
      </ErrorBoundary>,
    )
    expect(screen.getByText('fallback custom')).toBeInTheDocument()
  })

  it('chama onError quando captura', () => {
    const onError = vi.fn()
    render(
      <ErrorBoundary onError={onError}>
        <Boom message="x" />
      </ErrorBoundary>,
    )
    expect(onError).toHaveBeenCalled()
    const [err] = onError.mock.calls[0]
    expect(err).toBeInstanceOf(Error)
    expect((err as Error).message).toBe('x')
  })
})
