/**
 * Rotas da Fakestore API centralizadas. Manter aqui evita strings mágicas
 * espalhadas pelo código e facilita rastreio de mudanças se a API evoluir.
 *
 * Docs: https://fakestoreapi.com/docs
 */

export const API_BASE_URL = 'https://fakestoreapi.com'

export const ENDPOINTS = {
  // Auth
  authLogin: '/auth/login',

  // Products
  products: '/products',
  product: (id: number | string) => `/products/${id}`,

  // Users
  users: '/users',
  user: (id: number | string) => `/users/${id}`,
} as const
