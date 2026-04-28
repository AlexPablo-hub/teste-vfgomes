import { type ReactElement, type ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/Toaster'

/** Aceita string simples ou InitialEntry com state (para testar redirects). */
type InitialRoute = string | { pathname: string; state?: unknown; search?: string; hash?: string }

interface ProvidersProps {
  children: ReactNode
  initialRoute?: InitialRoute
}

/**
 * Wrappa o componente em todos os providers globais da aplicação.
 * Inclui o <Toaster /> para que testes possam verificar toasts disparados
 * por componentes de página (toast.error etc).
 */
function AllProviders({ children, initialRoute = '/' }: ProvidersProps) {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </MemoryRouter>
  )
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: InitialRoute
}

/**
 * Render que envolve com Router + AuthProvider. Use em testes que tocam
 * componentes que dependem de useAuth ou hooks do react-router-dom.
 */
export function renderWithProviders(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { initialRoute, ...rest } = options
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders initialRoute={initialRoute}>{children}</AllProviders>
    ),
    ...rest,
  })
}

export * from '@testing-library/react'
