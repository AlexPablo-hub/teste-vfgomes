/**
 * Fixtures e helpers compartilhados pelos testes E2E.
 *
 * As credenciais aqui são as exigidas pelo enunciado do teste técnico —
 * a Fakestore API as fornece via GET /users (sem real persistência).
 */

import type { Page } from '@playwright/test'

export const ADMIN = {
  username: 'mor_2314',
  password: '83r5^_',
}

export const CLIENT = {
  username: 'kevinryan',
  password: 'kev02937@',
}

/**
 * Login programático (preenche o form e espera o redirect). Mais rápido
 * que `goto('/login')` + clicks pra cada teste.
 */
export async function login(page: Page, role: 'admin' | 'client') {
  const creds = role === 'admin' ? ADMIN : CLIENT
  await page.goto('/login')
  // Clica na tab certa antes de digitar — a validação tab×role bloqueia
  // login com role errado.
  await page.getByRole('tab', { name: role === 'admin' ? /admin/i : /cliente/i }).click()
  await page.getByLabel(/usuário/i).fill(creds.username)
  await page.getByLabel(/senha/i).fill(creds.password)
  await page.getByRole('button', { name: /entrar/i }).click()
  // Espera o redirect terminar
  const expectedPath = role === 'admin' ? '/admin/estoque' : '/products'
  await page.waitForURL(`**${expectedPath}`, { timeout: 10_000 })
}

/**
 * Limpa todo o storage local entre testes para isolar estado. Chamamos
 * antes de qualquer teste que dependa de estado fresco.
 */
export async function clearStorage(page: Page) {
  await page.goto('/')
  await page.evaluate(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })
}
