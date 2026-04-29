import { test, expect } from '@playwright/test'
import { clearStorage, login } from './fixtures'

test.describe('Admin — CRUD de produtos', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
    await login(page, 'admin')
    // Espera a tabela hidratar
    await expect(
      page.getByRole('button', { name: /adicionar produto/i }),
    ).toBeVisible({ timeout: 10_000 })
  })

  test('cria produto novo escolhendo imagem da galeria', async ({ page }) => {
    await page.getByRole('button', { name: /adicionar produto/i }).click()
    const modal = page.getByRole('heading', { name: /novo produto/i })
    await expect(modal).toBeVisible()

    // Preenche o form
    await page.getByLabel(/título/i).fill('Produto E2E Galeria')
    await page.getByLabel(/preço.*r\$/i).fill('199')
    await page.getByLabel(/descrição/i).fill('Criado pelo teste E2E com imagem da galeria')

    // Abre galeria de imagens e seleciona a primeira disponível
    await page.getByRole('button', { name: /escolher na galeria/i }).click()
    const gallery = page.getByRole('heading', { name: /galeria de imagens/i })
    await expect(gallery).toBeVisible()
    await page
      .getByRole('button', { name: /selecionar imagem/i })
      .first()
      .click()
    // Galeria fecha automaticamente após selecionar
    await expect(gallery).not.toBeVisible({ timeout: 3_000 })

    // Confirma criação
    await page.getByRole('button', { name: /criar produto/i }).click()

    // Toast de sucesso
    await expect(page.getByText(/produto criado/i)).toBeVisible({ timeout: 5_000 })
    // Produto aparece na tabela
    await expect(page.getByText('Produto E2E Galeria')).toBeVisible({ timeout: 5_000 })
  })

  test('rejeita criar produto com campos obrigatórios vazios', async ({ page }) => {
    await page.getByRole('button', { name: /adicionar produto/i }).click()
    await page.getByRole('button', { name: /criar produto/i }).click()
    // Erros inline aparecem (título/imagem/descrição/preço)
    await expect(page.getByText(/informe o título/i)).toBeVisible({ timeout: 3_000 })
  })

  test('busca filtra a tabela', async ({ page }) => {
    // Espera tabela popular
    const firstRow = page.locator('tbody tr').first()
    await expect(firstRow).toBeVisible({ timeout: 15_000 })

    const search = page.getByPlaceholder('Buscar produtos')
    // Filtra por uma string improvável
    await search.fill('zzz-improvavel-xyz')
    // Tabela vai pra empty state
    await expect(page.getByText(/nenhum produto encontrado/i)).toBeVisible({
      timeout: 3_000,
    })
  })

  test('botão "Ver na loja" abre /products em nova aba', async ({ page, context }) => {
    const link = page.getByRole('link', { name: /ver na loja/i })
    await expect(link).toBeVisible()
    // target=_blank → nova aba
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('href', '/products')

    // Confirma que abre numa aba nova mantendo a sessão admin
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      link.click(),
    ])
    await newPage.waitForLoadState('domcontentloaded')
    await expect(newPage).toHaveURL(/\/products/)
  })
})
