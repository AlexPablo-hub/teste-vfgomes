import { test, expect } from '@playwright/test'
import { clearStorage, login } from './fixtures'

test.describe('Navegação geral', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
  })

  test('rota inexistente cai na NotFoundPage estilizada', async ({ page }) => {
    await login(page, 'client')
    await page.goto('/rota-que-nao-existe-mesmo')
    // Página 404 NOIR LUXE
    await expect(page.getByText(/erro 404/i)).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText(/página não encontrada/i)).toBeVisible()
    // Botão de retorno à loja
    await expect(page.getByRole('link', { name: /explorar a loja/i })).toBeVisible()
  })

  test('filtros do /products refletem na URL (categoria via query)', async ({ page }) => {
    await login(page, 'client')
    await page.waitForURL('**/products')

    // Aguarda os produtos hidratarem
    await expect(page.locator('article').first()).toBeVisible({ timeout: 15_000 })

    // Acessa direto via URL e verifica que o header muda
    await page.goto('/products?categoria=eletronicos')
    // Header dinâmico (h1 = "Eletrônicos")
    await expect(page.getByRole('heading', { name: /eletrônicos/i }).first()).toBeVisible({
      timeout: 5_000,
    })
    // Document title também atualiza
    await expect(page).toHaveTitle(/Eletrônicos/i)
  })

  test('detalhe do produto — botão Voltar leva à loja', async ({ page }) => {
    await login(page, 'client')
    await expect(page.locator('article').first()).toBeVisible({ timeout: 15_000 })

    // Clica no primeiro produto para ir ao detalhe
    await page.locator('article a').first().click()
    await expect(page).toHaveURL(/\/products\/\d+$/)

    // Botão Voltar leva pra /products
    await page.getByRole('link', { name: /voltar/i }).click()
    await expect(page).toHaveURL(/\/products$/)
  })

  test('header em /checkout/sucesso é minimal (sem cart/favoritos/user)', async ({ page }) => {
    await login(page, 'client')
    await expect(page.locator('article').first()).toBeVisible({ timeout: 15_000 })
    // Adiciona produto e finaliza compra
    await page
      .getByRole('button', { name: /adicionar.*ao carrinho/i })
      .first()
      .click()
    await page.goto('/checkout')
    await page.getByLabel(/nome completo/i).fill('Teste Header')
    await page.getByLabel(/e-mail/i).fill('header@teste.com')
    await page.getByLabel(/cep/i).fill('12345678')
    await page.getByLabel(/^rua$/i).fill('R')
    await page.getByLabel(/^número$/i).fill('1')
    await page.getByLabel(/cidade/i).fill('SP')
    await page.getByRole('button', { name: /confirmar pedido/i }).click()
    await expect(page).toHaveURL(/\/checkout\/sucesso$/, { timeout: 10_000 })

    // No header minimal, NÃO há botão de carrinho/favoritos/usuário
    await expect(page.getByRole('button', { name: /abrir carrinho/i })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /abrir favoritos/i })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /abrir menu do usuário/i })).toHaveCount(0)
  })

  test('redirect-back após login só funciona se a role permite', async ({ page }) => {
    // Usuário não-logado tenta acessar /admin/estoque → vai pra /login com `from`
    await page.goto('/admin/estoque')
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 })

    // Loga como cliente — não pode voltar pra /admin/estoque (role inválida)
    await page.getByRole('tab', { name: /cliente/i }).click()
    await page.getByLabel('Usuário', { exact: true }).fill('kevinryan')
    await page.getByLabel('Senha', { exact: true }).fill('kev02937@')
    await page.getByRole('button', { name: /entrar/i }).click()

    // Cai no fallback do role (cliente → /products), NÃO em /admin/estoque
    await expect(page).toHaveURL(/\/products/, { timeout: 10_000 })
  })
})
