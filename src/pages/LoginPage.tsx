import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, Lock, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/cn'

type Tab = 'client' | 'admin'

export function LoginPage() {
  const { login, isAuthenticated, role } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [tab, setTab] = useState<Tab>('admin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({})

  if (isAuthenticated) {
    const target = role === 'admin' ? '/admin/estoque' : '/products'
    return <Navigate to={target} replace />
  }

  const validate = () => {
    const errs: typeof fieldErrors = {}
    if (!username.trim()) errs.username = 'Informe seu usuário.'
    if (!password) errs.password = 'Informe sua senha.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!validate()) return
    setSubmitting(true)
    const result = await login(username, password)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    const from = (location.state as { from?: string } | null)?.from
    const target = from ?? (result.user.role === 'admin' ? '/admin/estoque' : '/products')
    navigate(target, { replace: true })
  }

  const handleTabChange = (next: Tab) => {
    setTab(next)
    if (next === 'admin') {
      setUsername('mor_2314')
      setPassword('83r5^_')
    } else {
      setUsername('kevinryan')
      setPassword('kev02937@')
    }
    setError(null)
    setFieldErrors({})
  }

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-[var(--color-background)]">
      {/* Decoração: blur circles violeta */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[250px] -top-[250px] h-[500px] w-[500px] rounded-full bg-[var(--color-primary)]/10 blur-[60px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-[250px] -left-[250px] h-[500px] w-[500px] rounded-full bg-[var(--color-primary)]/5 blur-[60px]"
      />

      {/* HERO — esquerda (sempre dark, sobreposto a imagem escura) */}
      <aside className="relative hidden flex-1 items-end overflow-hidden lg:flex">
        <img
          src="/images/Image_b5jtkjb5jtkjb5jt.png"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(58deg, rgb(2,6,23) 0%, rgba(2,6,23,0.2) 50%, rgba(2,6,23,0) 100%)',
          }}
        />
        <div className="relative z-10 flex w-full flex-col gap-[14.9px] p-20">
          <h1 className="text-[48px] font-bold uppercase leading-[52.8px] tracking-[-2.4px] text-white">
            NOIR LUXE
          </h1>
          <p className="max-w-[448px] text-[18px] leading-[28.8px] text-slate-300">
            A seleção definitiva para quem exige o extraordinário.
          </p>
          <div className="mt-4 flex items-center gap-4">
            <span aria-hidden className="h-0.5 w-12 bg-[var(--color-primary)]" />
            <span className="text-xs font-semibold uppercase tracking-[1.2px] text-slate-400">
              EST. 2026
            </span>
          </div>
        </div>
      </aside>

      {/* FORM — direita (responde ao toggle de tema) */}
      <section className="relative flex flex-1 items-center justify-center bg-[var(--color-background)] px-6 py-10 sm:px-10 lg:p-24">
        <div className="w-full max-w-[440px]">
          {/* Marca em mobile */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span aria-hidden className="h-0.5 w-8 bg-[var(--color-primary)]" />
            <span className="text-base font-bold uppercase tracking-[0.2em] text-[var(--color-foreground)]">
              NOIR LUXE
            </span>
          </div>

          <div className="flex flex-col gap-[7px]">
            <h2 className="text-[30px] font-semibold leading-9 tracking-[-0.3px] text-[var(--color-foreground)]">
              Bem-vindo de volta
            </h2>
            <p className="text-[16px] leading-[25.6px] text-[var(--color-foreground-subtle)]">
              Por favor, insira suas credenciais para continuar.
            </p>
          </div>

          {/* Toggle Cliente/Administrador */}
          <div
            role="tablist"
            aria-label="Tipo de conta"
            className="mt-12 flex items-center justify-center gap-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-secondary)] p-[5px] backdrop-blur-md"
          >
            {(['client', 'admin'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => handleTabChange(t)}
                className={cn(
                  'flex-1 rounded-lg px-6 py-3 text-sm font-medium tracking-[0.28px] transition-all',
                  tab === t
                    ? 'bg-[var(--color-primary)] text-white shadow-sm'
                    : 'text-[var(--color-foreground-subtle)] hover:text-[var(--color-foreground)]',
                )}
              >
                {t === 'client' ? 'Cliente' : 'Administrador'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-12 flex flex-col gap-6" noValidate>
            {/* Usuário */}
            <div className="flex flex-col gap-2">
              <label htmlFor="login-username" className="text-sm font-medium tracking-[0.28px] text-[var(--color-foreground-muted)]">
                Usuário
              </label>
              <div className="relative">
                <span aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-foreground-faintest)]">
                  <UserIcon className="h-4 w-4" />
                </span>
                <input
                  id="login-username"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  aria-invalid={!!fieldErrors.username}
                  aria-describedby={fieldErrors.username ? 'login-username-error' : undefined}
                  className="h-14 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] pl-[49px] pr-4 text-[16px] text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-faintest)] transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                />
              </div>
              {fieldErrors.username && (
                <p id="login-username-error" className="text-xs text-[var(--color-destructive)]">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            {/* Senha */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-sm font-medium tracking-[0.28px] text-[var(--color-foreground-muted)]">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() =>
                    toast.info('Funcionalidade em desenvolvimento', {
                      description:
                        'Em breve você poderá recuperar sua senha por email.',
                    })
                  }
                  className="text-xs font-semibold tracking-[0.6px] text-[var(--color-violet-soft)] hover:underline"
                >
                  Esqueceu a Senha?
                </button>
              </div>
              <div className="relative">
                <span aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-foreground-faintest)]">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                  className="h-14 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] pl-[49px] pr-12 text-[16px] text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-faintest)] transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-foreground-faintest)] transition-colors hover:text-[var(--color-foreground)]"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="login-password-error" className="text-xs text-[var(--color-destructive)]">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-[var(--color-destructive)]/30 bg-[var(--color-destructive)]/10 px-4 py-3 text-sm text-[var(--color-destructive)] animate-fade-in"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[var(--color-primary)] text-[18px] font-normal text-white shadow-[0px_20px_25px_-5px_rgba(76,29,149,0.2),0px_8px_10px_-6px_rgba(76,29,149,0.2)] transition-all hover:bg-[var(--color-violet-strong)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Entrando…' : (
                <>
                  Entrar <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-12 flex flex-col gap-4 border-t border-[var(--color-border-subtle)] pt-8">
            <p className="text-center text-base text-[var(--color-foreground-faint)]">
              Não tem uma conta?{' '}
              <button
                type="button"
                onClick={() =>
                  toast.info('Funcionalidade em desenvolvimento', {
                    description:
                      'Em breve será possível solicitar acesso à plataforma NOIR_LUXE.',
                  })
                }
                className="font-medium text-[var(--color-foreground)] hover:underline"
              >
                Solicitar Acesso
              </button>
            </p>
            <ul className="flex items-center justify-center gap-6">
              {['PRIVACIDADE', 'TERMOS', 'SUPORTE'].map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="text-xs font-semibold uppercase tracking-[1.2px] text-[var(--color-foreground-faintest)] transition-colors hover:text-[var(--color-foreground)]"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
