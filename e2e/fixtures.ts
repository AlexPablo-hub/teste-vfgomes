/**
 * Fixtures e helpers compartilhados pelos testes E2E.
 *
 * As credenciais aqui são as que a Fakestore API expõe via GET /users
 * (sem real persistência) — usadas como seed para os dois perfis.
 */

import type { Page } from '@playwright/test'
import { mockFakestore } from './mock-api'

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
  await page.goto('/login', { waitUntil: 'domcontentloaded' })

  // Espera os inputs estarem visíveis (Framer Motion stagger pode atrasar
  // a montagem; sem isso o .fill() pode rodar antes da animação terminar).
  const userInput = page.getByLabel('Usuário', { exact: true })
  const passInput = page.getByLabel('Senha', { exact: true })
  await userInput.waitFor({ state: 'visible', timeout: 10_000 })

  // Clica na tab certa antes de digitar — a validação tab×role bloqueia
  // login com role errado. Texto exato evita conflito com "Administrador"
  // casando com outras palavras.
  const tabName = role === 'admin' ? 'Administrador' : 'Cliente'
  await page.getByRole('tab', { name: tabName }).click()

  await userInput.fill(creds.username)
  await passInput.fill(creds.password)

  // O botão tem texto "Entrar" + ícone — name=/^entrar$/i evita confusão
  // com possíveis "Entrar com…" ou outros textos que comecem com "entrar".
  await page.getByRole('button', { name: /^entrar/i }).click()

  // Espera o redirect terminar — timeout generoso porque o submit faz POST
  // /auth/login + GET /users na Fakestore real (latência variável em CI).
  const expectedPath = role === 'admin' ? '/admin/estoque' : '/products'
  await page.waitForURL(`**${expectedPath}`, { timeout: 30_000 })
}

/**
 * Limpa todo o storage local entre testes para isolar estado E ativa o
 * mock da Fakestore API (rotas interceptadas pelo Playwright).
 *
 * Sequência crítica:
 *  1. mockFakestore — registra rotas interceptadas
 *  2. clearCookies do contexto
 *  3. goto('/login') — rota pública, não dispara RootRedirect
 *  4. evaluate clear storage — limpa localStorage/sessionStorage
 *  5. reload — força AuthContext re-init com storage 100% vazio
 *     (sem isso, o useState init do AuthProvider já tinha lido o storage
 *     da sessão anterior e ficava com user fantasma em memória)
 */
export async function clearStorage(page: Page) {
  await mockFakestore(page)
  await page.context().clearCookies()
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })
  await page.reload({ waitUntil: 'domcontentloaded' })
}
