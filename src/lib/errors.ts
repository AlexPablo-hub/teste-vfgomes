/**
 * Classes de erro tipadas — atende o requisito 'Tratamento avançado de erros'
 * do README. O interceptor do axios mapeia respostas HTTP para essas classes,
 * permitindo que componentes saibam *o tipo* do problema sem inspecionar
 * detalhes do axios.
 *
 * Uso típico em UI:
 *
 *   try { await authService.login(...) }
 *   catch (err) {
 *     if (err instanceof AuthError) showFieldError('Credenciais inválidas')
 *     else if (err instanceof NetworkError) toast.error('Sem conexão')
 *     else throw err  // deixa o ErrorBoundary global pegar
 *   }
 */

export class AppError extends Error {
  /** Código simbólico (ex: 'AUTH_INVALID_CREDENTIALS'). Útil para logs/i18n. */
  readonly code: string
  /** Causa original (opcional). */
  readonly cause?: unknown

  constructor(message: string, code = 'APP_ERROR', cause?: unknown) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.cause = cause
    // Restaura prototype chain (necessário para `instanceof` funcionar quando
    // herdamos de Error em targets ES5/transpilados — TS recomenda).
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class ApiError extends AppError {
  readonly status: number
  readonly payload?: unknown

  constructor(
    message: string,
    status: number,
    payload?: unknown,
    code = 'API_ERROR',
    cause?: unknown,
  ) {
    super(message, code, cause)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class AuthError extends ApiError {
  constructor(
    message = 'Não autenticado.',
    status = 401,
    payload?: unknown,
    cause?: unknown,
  ) {
    super(message, status, payload, 'AUTH_ERROR', cause)
    this.name = 'AuthError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Servidor indisponível. Verifique sua conexão.', cause?: unknown) {
    super(message, 'NETWORK_ERROR', cause)
    this.name = 'NetworkError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class ValidationError extends AppError {
  /** Map de campo → mensagem (para forms). */
  readonly fields?: Record<string, string>

  constructor(message: string, fields?: Record<string, string>, cause?: unknown) {
    super(message, 'VALIDATION_ERROR', cause)
    this.name = 'ValidationError'
    this.fields = fields
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Type guard útil em catch blocks. Diferente de `instanceof`, funciona com
 * erros serializados/desserializados (raros, mas existem em alguns flows).
 */
export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError
}
