import { test, expect } from '@playwright/test'
import { ADMIN, CLIENT, clearStorage, login } from './fixtures'

test.describe('Autenticação', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
  })

  test('admin loga e é redirecionado para /admin/estoque', async ({ page }) => {
    await login(page, 'admin')
    await expect(page).toHaveURL(/\/admin\/estoque$/)
    await expect(page.getByRole('heading', { name: /gestão de estoque/i })).toBeVisible()
  })

  test('cliente loga e é redirecionado para /products', async ({ page }) => {
    await login(page, 'client')
    await expect(page).toHaveURL(/\/products$/)
    // Header da loja com título "Produtos" (default header)
    await expect(page.getByRole('heading', { name: /produtos/i }).first()).toBeVisible()
  })

  test('credenciais inválidas mostram erro 401 inline', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('tab', { name: 'Cliente' }).click()
    await page.getByLabel('Usuário', { exact: true }).fill('inexistente')
    await page.getByLabel('Senha', { exact: true }).fill('errado')
    await page.getByRole('button', { name: /entrar/i }).click()
    // Banner inline com role="alert" (validação 401)
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5_000 })
  })

  test('cliente tentando logar na tab Admin é bloqueado', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('tab', { name: 'Administrador' }).click()
    await page.getByLabel('Usuário', { exact: true }).fill(CLIENT.username)
    await page.getByLabel('Senha', { exact: true }).fill(CLIENT.password)
    await page.getByRole('button', { name: /entrar/i }).click()
    // Permanece em /login (toast vermelho de role inválida)
    await page.waitForTimeout(1_000)
    await expect(page).toHaveURL(/\/login/)
  })

  test('cliente acessando /admin/estoque é redirecionado para /products', async ({ page }) => {
    await login(page, 'client')
    await page.goto('/admin/estoque')
    await expect(page).toHaveURL(/\/products/, { timeout: 5_000 })
  })

  test('admin pode acessar /products (hierarquia)', async ({ page }) => {
    await login(page, 'admin')
    await page.goto('/products')
    await expect(page).toHaveURL(/\/products$/)
    await expect(page.getByRole('heading', { name: /produtos/i }).first()).toBeVisible()
  })

  test('logout limpa contexto e volta para /login', async ({ page }) => {
    await login(page, 'client')
    // Abre menu do usuário no header
    await page.getByRole('button', { name: /abrir menu do usuário/i }).click()
    await page.getByRole('menuitem', { name: /sair/i }).click()
    await expect(page).toHaveURL(/\/login/)
    // localStorage de auth foi limpo
    const authUser = await page.evaluate(() => window.localStorage.getItem('auth-user'))
    expect(authUser).toBeNull()
  })

  test('rota raiz redireciona para login se não autenticado', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 })
  })

  test('persistência de sessão — refresh mantém o usuário logado', async ({ page }) => {
    await login(page, 'admin')
    await page.reload()
    await expect(page).toHaveURL(/\/admin\/estoque$/)
    await expect(page.getByRole('heading', { name: /gestão de estoque/i })).toBeVisible()
  })

  test('credenciais corretas — admin (smoke da fixture)', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('tab', { name: 'Administrador' }).click()
    await page.getByLabel('Usuário', { exact: true }).fill(ADMIN.username)
    await page.getByLabel('Senha', { exact: true }).fill(ADMIN.password)
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page).toHaveURL(/\/admin\/estoque$/, { timeout: 10_000 })
  })
})
