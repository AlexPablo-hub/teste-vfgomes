import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Override do fallback default. */
  fallback?: ReactNode
  /** Hook para integração com Sentry / log externo. */
  onError?: (error: Error, info: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Captura erros não tratados em qualquer descendente do React tree.
 * Exibe um fallback elegante alinhado à identidade NOIR_LUXE.
 *
 * Wrappa o RouterProvider no App.tsx — assim qualquer página renderizando
 * com erro mostra fallback em vez da tela branca.
 *
 * Limitações intrínsecas do React (não específicas desta impl):
 *  - NÃO captura erros em event handlers (use try/catch + toast.error)
 *  - NÃO captura erros assíncronos (idem)
 *  - NÃO captura erros em SSR (não aplicável aqui)
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary] caught:', error, info.componentStack)
    this.props.onError?.(error, info)
  }

  private reset = () => {
    this.setState({ hasError: false, error: null })
  }

  private reload = () => {
    window.location.reload()
  }

  override render() {
    if (!this.state.hasError) return this.props.children
    if (this.props.fallback) return this.props.fallback

    return (
      <div className="grid min-h-screen place-items-center bg-[var(--color-background)] px-6">
        <div className="max-w-md text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-violet-soft)]">
            Erro inesperado
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white">Algo deu errado.</h1>
          <p className="mt-3 text-sm text-[var(--color-foreground-subtle)]">
            Encontramos um problema ao carregar esta tela. Você pode tentar de
            novo ou recarregar a página.
          </p>
          {this.state.error?.message && (
            <pre className="mt-4 max-h-32 overflow-auto rounded-md bg-[var(--color-card)] p-3 text-left text-xs text-[var(--color-foreground-faint)]">
              {this.state.error.message}
            </pre>
          )}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.reset}
              className="rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
            >
              Tentar novamente
            </button>
            <button
              type="button"
              onClick={this.reload}
              className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-violet-strong)]"
            >
              Recarregar página
            </button>
          </div>
        </div>
      </div>
    )
  }
}
