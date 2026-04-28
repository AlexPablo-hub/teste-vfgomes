import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4 text-center">
      <div className="max-w-md">
        <p className="text-sm font-semibold text-[var(--color-primary)]">404</p>
        <h1 className="mt-2 text-3xl font-bold">Página não encontrada</h1>
        <p className="mt-2 text-[var(--color-muted-foreground)]">
          A página que você está tentando acessar não existe ou foi movida.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-foreground)] hover:opacity-90"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
