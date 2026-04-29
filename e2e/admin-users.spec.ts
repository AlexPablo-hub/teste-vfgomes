import { test, expect } from '@playwright/test'
import { clearStorage, login } from './fixtures'

test.describe('Admin — CRUD de usuários', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
    await login(page, 'admin')
    await page.goto('/admin/clientes')
    await expect(
      page.getByRole('heading', { name: /gestão de clientes/i }),
    ).toBeVisible({ timeout: 10_000 })
  })

  test('cria usuário novo com validação completa', async ({ page }) => {
    await page.getByRole('button', { name: /adicionar usuário/i }).click()
    await expect(page.getByRole('heading', { name: /novo usuário/i })).toBeVisible()

    await page.getByLabel(/primeiro nome/i).fill('Maria')
    await page.getByLabel(/sobrenome/i).fill('Silva E2E')
    await page.getByLabel(/^usuário$/i).fill('maria_e2e')
    await page.getByLabel(/e-mail/i).fill('maria.e2e@test.com')
    await page.getByLabel(/^senha$/i).fill('senha123')
    await page.getByLabel(/telefone/i).fill('11987654321')
    await page.getByLabel(/cidade/i).fill('São Paulo')
    await page.getByLabel(/cep/i).fill('12345678')

    await page.getByRole('button', { name: /criar usuário/i }).click()

    await expect(page.getByText(/usuário criado/i)).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText('Maria Silva E2E')).toBeVisible({ timeout: 5_000 })
  })

  test('rejeita e-mail inválido', async ({ page }) => {
    await page.getByRole('button', { name: /adicionar usuário/i }).click()
    await page.getByLabel(/primeiro nome/i).fill('A')
    await page.getByLabel(/sobrenome/i).fill('B')
    await page.getByLabel(/^usuário$/i).fill('user_x')
    await page.getByLabel(/e-mail/i).fill('sem-arroba-aqui')
    await page.getByLabel(/^senha$/i).fill('p')
    await page.getByLabel(/telefone/i).fill('11987654321')
    await page.getByLabel(/cidade/i).fill('SP')
    await page.getByLabel(/cep/i).fill('12345678')
    await page.getByRole('button', { name: /criar usuário/i }).click()

    await expect(page.getByText(/e-mail inválido/i)).toBeVisible({ timeout: 3_000 })
  })

  test('busca filtra por nome/email/username', async ({ page }) => {
    const search = page.getByPlaceholder(/buscar por nome/i)
    // Mor_2314 é uma das 2 contas obrigatórias do enunciado — deve estar na lista
    await search.fill('mor_2314')
    await expect(page.getByText(/mor_2314/i).first()).toBeVisible({ timeout: 5_000 })
  })

  test('filtro de papel funciona', async ({ page }) => {
    // Usa o select de papel pra filtrar só admins
    const roleSelect = page.getByLabel(/filtrar por papel/i)
    await roleSelect.selectOption('admin')
    // mor_2314 (admin) deve continuar visível
    await expect(page.getByText(/mor_2314/i).first()).toBeVisible()
  })
})
