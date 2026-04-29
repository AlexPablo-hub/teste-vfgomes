import { test, expect } from '@playwright/test'
import { clearStorage, login } from './fixtures'

test.describe('Cliente — fluxo de compra', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
  })

  test('navega no catálogo, adiciona ao carrinho e ajusta quantidade', async ({ page }) => {
    await login(page, 'client')
    // Espera a hidratação trazer pelo menos 1 produto da Fakestore
    await expect(page.locator('article').first()).toBeVisible({ timeout: 15_000 })

    // Adiciona o primeiro produto via botão "Adicionar ao Carrinho"
    await page
      .getByRole('button', { name: /adicionar.*ao carrinho/i })
      .first()
      .click()

    // Abre o carrinho
    await page.getByRole('button', { name: /abrir carrinho/i }).click()
    const drawer = page.getByRole('dialog', { name: /carrinho/i })
    await expect(drawer).toBeVisible()

    // Quantidade inicial = 1
    await expect(drawer.getByText(/^1$/).first()).toBeVisible()

    // Incrementa pra 2
    await drawer.getByRole('button', { name: /aumentar quantidade/i }).first().click()
    await expect(drawer.getByText(/^2$/).first()).toBeVisible()

    // Subtotal aparece (formato BRL)
    await expect(drawer.getByText(/R\$\s/).first()).toBeVisible()
  })

  test('remove item do carrinho', async ({ page }) => {
    await login(page, 'client')
    await expect(page.locator('article').first()).toBeVisible({ timeout: 15_000 })
    await page
      .getByRole('button', { name: /adicionar.*ao carrinho/i })
      .first()
      .click()

    await page.getByRole('button', { name: /abrir carrinho/i }).click()
    const drawer = page.getByRole('dialog', { name: /carrinho/i })
    await drawer.getByRole('button', { name: /remover/i }).first().click()

    // Drawer mostra empty state após remoção
    await expect(drawer.getByText(/seu carrinho está vazio/i)).toBeVisible()
  })

  test('checkout — valida e-mail inválido', async ({ page }) => {
    await login(page, 'client')
    await expect(page.locator('article').first()).toBeVisible({ timeout: 15_000 })

    // Adiciona produto
    await page
      .getByRole('button', { name: /adicionar.*ao carrinho/i })
      .first()
      .click()

    // Vai pro checkout
    await page.goto('/checkout')
    await expect(page.getByRole('heading', { name: /finalizar compra/i })).toBeVisible()

    // Quebra o e-mail e tenta confirmar
    await page.getByLabel(/e-mail/i).fill('email-invalido')
    await page.getByRole('button', { name: /confirmar pedido/i }).click()
    await expect(page.getByText(/e-mail inválido/i)).toBeVisible({ timeout: 3_000 })
  })

  test('checkout — fluxo completo até /checkout/sucesso', async ({ page }) => {
    await login(page, 'client')
    await expect(page.locator('article').first()).toBeVisible({ timeout: 15_000 })
    await page
      .getByRole('button', { name: /adicionar.*ao carrinho/i })
      .first()
      .click()

    await page.goto('/checkout')

    // Form vem pré-preenchido (kevinryan tem address na Fakestore), mas
    // garantimos que os campos estão válidos
    await page.getByLabel(/nome completo/i).fill('Maria Silva Teste')
    await page.getByLabel(/e-mail/i).fill('maria@teste.com')
    await page.getByLabel(/cep/i).fill('12345678')
    await page.getByLabel(/^rua$/i).fill('Av Paulista')
    await page.getByLabel(/^número$/i).fill('100')
    await page.getByLabel(/cidade/i).fill('São Paulo')

    await page.getByRole('button', { name: /confirmar pedido/i }).click()

    await expect(page).toHaveURL(/\/checkout\/sucesso$/, { timeout: 10_000 })
    await expect(page.getByRole('heading', { name: /pedido realizado/i })).toBeVisible()
    // Comprovante mostra número do pedido com prefixo NL
    await expect(page.getByText(/#NL-/).first()).toBeVisible()
  })

  test('/checkout/sucesso sobrevive a F5 (sessionStorage)', async ({ page }) => {
    await login(page, 'client')
    await expect(page.locator('article').first()).toBeVisible({ timeout: 15_000 })
    await page
      .getByRole('button', { name: /adicionar.*ao carrinho/i })
      .first()
      .click()

    await page.goto('/checkout')
    await page.getByLabel(/nome completo/i).fill('Teste F5')
    await page.getByLabel(/e-mail/i).fill('f5@teste.com')
    await page.getByLabel(/cep/i).fill('12345678')
    await page.getByLabel(/^rua$/i).fill('R')
    await page.getByLabel(/^número$/i).fill('1')
    await page.getByLabel(/cidade/i).fill('SP')
    await page.getByRole('button', { name: /confirmar pedido/i }).click()

    await expect(page).toHaveURL(/\/checkout\/sucesso$/, { timeout: 10_000 })
    // F5 — não deve voltar pra /products
    await page.reload()
    await expect(page).toHaveURL(/\/checkout\/sucesso$/)
    await expect(page.getByRole('heading', { name: /pedido realizado/i })).toBeVisible()
  })
})
