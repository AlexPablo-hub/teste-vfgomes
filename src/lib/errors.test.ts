import { describe, it, expect } from 'vitest'
import {
  AppError,
  ApiError,
  AuthError,
  NetworkError,
  ValidationError,
  isAppError,
} from './errors'

describe('errors', () => {
  it('AppError tem code default e mantém prototype para instanceof', () => {
    const err = new AppError('boom')
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(AppError)
    expect(err.code).toBe('APP_ERROR')
    expect(err.message).toBe('boom')
  })

  it('ApiError preserva status e payload', () => {
    const err = new ApiError('Bad request', 400, { field: 'email' })
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toBeInstanceOf(AppError)
    expect(err.status).toBe(400)
    expect(err.payload).toEqual({ field: 'email' })
    expect(err.code).toBe('API_ERROR')
  })

  it('AuthError herda de ApiError com status 401 default', () => {
    const err = new AuthError()
    expect(err).toBeInstanceOf(AuthError)
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toBeInstanceOf(AppError)
    expect(err.status).toBe(401)
    expect(err.code).toBe('AUTH_ERROR')
  })

  it('NetworkError tem mensagem default amigável', () => {
    const err = new NetworkError()
    expect(err).toBeInstanceOf(NetworkError)
    expect(err).toBeInstanceOf(AppError)
    expect(err).not.toBeInstanceOf(ApiError)
    expect(err.message).toMatch(/indisponível/i)
    expect(err.code).toBe('NETWORK_ERROR')
  })

  it('ValidationError carrega map de campos', () => {
    const err = new ValidationError('Form inválido', { email: 'obrigatório' })
    expect(err.fields).toEqual({ email: 'obrigatório' })
    expect(err.code).toBe('VALIDATION_ERROR')
  })

  it('isAppError type guard', () => {
    expect(isAppError(new AppError('x'))).toBe(true)
    expect(isAppError(new ApiError('x', 500))).toBe(true)
    expect(isAppError(new Error('plain'))).toBe(false)
    expect(isAppError('string')).toBe(false)
    expect(isAppError(null)).toBe(false)
  })
})
