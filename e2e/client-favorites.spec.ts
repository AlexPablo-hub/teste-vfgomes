import { test, expect } from '@playwright/test'
import { clearStorage, login } from './fixtures'

test.describe('Cliente — favoritos', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
  })

  test('toggle favorito num card adiciona ao drawer', async ({ page }) => {
    await login(page, 'client')
    await expect(page.locator('article').first()).toBeVisible({ timeout: 15_000 })

    // Clica no coração do primeiro card
    await page
      .getByRole('button', { name: /adicionar aos favoritos/i })
      .first()
      .click()

    // Badge no header mostra 1 (mesmo elemento que rendeiza após .items.length)
    const favBtn = page.getByRole('button', { name: /abrir favoritos/i })
    await expect(favBtn).toBeVisible()
    // Abre drawer
    await favBtn.click()
    const drawer = page.getByRole('dialog', { name: /favoritos/i })
    await expect(drawer).toBeVisible()
    await expect(drawer.getByText(/seus favoritos/i)).toBeVisible()
    // Pelo menos 1 item dentro do drawer
    await expect(drawer.locator('li').first()).toBeVisible()
  })

  test('mover ao carrinho a partir dos favoritos', async ({ page }) => {
    await login(page, 'client')
    await expect(page.locator('article').first()).toBeVisible({ timeout: 15_000 })
    await page
      .getByRole('button', { name: /adicionar aos favoritos/i })
      .first()
      .click()

    await page.getByRole('button', { name: /abrir favoritos/i }).click()
    const drawer = page.getByRole('dialog', { name: /favoritos/i })
    await drawer.getByRole('button', { name: /mover ao carrinho/i }).click()

    // Toast de sucesso
    await expect(page.getByText(/adicionado ao carrinho/i)).toBeVisible({ timeout: 3_000 })

    // Carrinho agora tem 1 item — fecha o drawer de favoritos e abre o de cart
    await drawer.getByRole('button', { name: /fechar favoritos/i }).click()
    await page.getByRole('button', { name: /abrir carrinho/i }).click()
    const cart = page.getByRole('dialog', { name: /carrinho/i })
    await expect(cart.locator('li').first()).toBeVisible()
  })

  test('toggle 2x remove o favorito', async ({ page }) => {
    await login(page, 'client')
    await expect(page.locator('article').first()).toBeVisible({ timeout: 15_000 })

    const heart = page
      .getByRole('button', { name: /adicionar aos favoritos/i })
      .first()
    await heart.click()
    // Após o toggle, o aria-label muda para "Remover dos favoritos"
    await expect(
      page.getByRole('button', { name: /remover dos favoritos/i }).first(),
    ).toBeVisible()

    // Clica de novo pra remover
    await page
      .getByRole('button', { name: /remover dos favoritos/i })
      .first()
      .click()

    // Drawer agora mostra empty state
    await page.getByRole('button', { name: /abrir favoritos/i }).click()
    await expect(page.getByText(/nenhum favorito ainda/i)).toBeVisible()
  })
})
