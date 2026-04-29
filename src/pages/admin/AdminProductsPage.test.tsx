import { describe, it, expect, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { renderWithProviders, screen, waitFor } from '@/test/utils'
import { AdminProductsPage } from './AdminProductsPage'
import { useProductsStore } from '@/stores/productsStore'
import { mockProducts } from '@/data/mocks'

const BASE = 'https://fakestoreapi.com'

describe('AdminProductsPage', () => {
  beforeEach(() => {
    // Cada teste começa com store reseteado (mocks NOIR_LUXE) e localStorage limpo.
    useProductsStore.setState({ products: mockProducts, hydratedAt: null })
  })

  it('renderiza heading e botão Adicionar Produto', async () => {
    renderWithProviders(<AdminProductsPage />, { initialRoute: '/admin/estoque' })
    expect(
      await screen.findByRole('heading', { name: /gestão de estoque/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /adicionar produto/i })).toBeInTheDocument()
  })

  it('lista produtos do store inicialmente (mocks NOIR_LUXE)', async () => {
    renderWithProviders(<AdminProductsPage />, { initialRoute: '/admin/estoque' })
    // Mocks têm pelo menos Midnight Chronograph (id 2)
    expect(await screen.findByText('Midnight Chronograph')).toBeInTheDocument()
  })

  it('hidrata via API e substitui a lista quando GET /products retorna dados', async () => {
    renderWithProviders(<AdminProductsPage />, { initialRoute: '/admin/estoque' })

    // Aguarda a hidratação substituir os mocks pelos da API (Test Product, Another Product)
    expect(await screen.findByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('Another Product')).toBeInTheDocument()
  })

  it('mantém produtos no store quando hidratação falha (modo offline)', async () => {
    server.use(http.get(`${BASE}/products`, () => HttpResponse.error()))

    renderWithProviders(<AdminProductsPage />, { initialRoute: '/admin/estoque' })

    // Mocks NOIR_LUXE continuam visíveis (fallback offline)
    expect(await screen.findByText('Midnight Chronograph')).toBeInTheDocument()
  })

  it('filtra produtos por busca', async () => {
    // Força modo offline pra preservar mocks NOIR_LUXE no store durante o teste
    server.use(http.get(`${BASE}/products`, () => HttpResponse.error()))

    const user = userEvent.setup()
    renderWithProviders(<AdminProductsPage />, { initialRoute: '/admin/estoque' })

    // Aguarda render com mocks (Midnight Chronograph existe nos mockProducts)
    await screen.findByText('Midnight Chronograph')

    const searchInput = screen.getByPlaceholderText('Buscar produtos')
    await user.type(searchInput, 'midnight')

    // Apenas produtos com "midnight" no título devem aparecer
    expect(screen.getByText('Midnight Chronograph')).toBeInTheDocument()
    // Outros mocks devem sumir
    expect(screen.queryByText('Raven Silk Pumps')).not.toBeInTheDocument()
  })

  it('abre modal de novo produto ao clicar Adicionar Produto', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AdminProductsPage />, { initialRoute: '/admin/estoque' })

    await screen.findByText('Midnight Chronograph')
    await user.click(screen.getByRole('button', { name: /adicionar produto/i }))

    expect(await screen.findByRole('heading', { name: /novo produto/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /criar produto/i })).toBeInTheDocument()
  })

  it('cria produto: chama POST /products + adiciona ao store + toast success', async () => {
    let postCalled = false
    server.use(
      http.post(`${BASE}/products`, async ({ request }) => {
        postCalled = true
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: 999, ...body, rating: { rate: 0, count: 0 } })
      }),
    )

    const user = userEvent.setup()
    renderWithProviders(<AdminProductsPage />, { initialRoute: '/admin/estoque' })

    await screen.findByText('Midnight Chronograph')
    await user.click(screen.getByRole('button', { name: /adicionar produto/i }))

    // Preenche o form
    await user.type(screen.getByLabelText(/título/i), 'Teste Auto')
    // O input "Preço" tem placeholder vazio mas label "Preço (R$)"
    const priceInput = screen.getByLabelText(/preço/i)
    await user.clear(priceInput)
    await user.type(priceInput, '199')
    await user.type(screen.getByLabelText(/url da imagem/i), '/images/test.jpg')
    await user.type(screen.getByLabelText(/descrição/i), 'Produto criado pelo teste')

    await user.click(screen.getByRole('button', { name: /criar produto/i }))

    // POST /products foi chamado (consumo de API confirmado)
    await waitFor(() => expect(postCalled).toBe(true))

    // Toast success aparece
    expect(await screen.findByText(/produto criado/i)).toBeInTheDocument()

    // Produto aparece na lista (store local atualizado)
    expect(await screen.findByText('Teste Auto')).toBeInTheDocument()
  })

  it('exclui produto: chama DELETE /products/:id + remove do store + toast', async () => {
    // Força offline pra manter os mocks NOIR_LUXE (id=2 = Midnight Chronograph)
    server.use(http.get(`${BASE}/products`, () => HttpResponse.error()))

    let deletedId: string | null = null
    server.use(
      http.delete(`${BASE}/products/:id`, ({ params }) => {
        deletedId = params.id as string
        return HttpResponse.json({ id: Number(params.id) })
      }),
    )

    const user = userEvent.setup()
    renderWithProviders(<AdminProductsPage />, { initialRoute: '/admin/estoque' })

    await screen.findByText('Midnight Chronograph')

    // Clica botão excluir do produto Midnight Chronograph (id=2 nos mocks)
    const deleteButton = screen.getByRole('button', { name: /excluir midnight chronograph/i })
    await user.click(deleteButton)

    // ConfirmDialog aparece
    expect(await screen.findByRole('heading', { name: /excluir/i })).toBeInTheDocument()

    // Confirma
    await user.click(screen.getByRole('button', { name: /^excluir$/i }))

    // DELETE foi chamado
    await waitFor(() => expect(deletedId).toBe('2'))

    // Produto sumiu da lista
    await waitFor(() => {
      expect(screen.queryByText('Midnight Chronograph')).not.toBeInTheDocument()
    })

    expect(await screen.findByText(/produto excluído/i)).toBeInTheDocument()
  })

  it('botão Atualizar dispara refresh manual do GET /products', async () => {
    let getCount = 0
    server.use(
      http.get(`${BASE}/products`, () => {
        getCount += 1
        return HttpResponse.json([])
      }),
    )

    const user = userEvent.setup()
    renderWithProviders(<AdminProductsPage />, { initialRoute: '/admin/estoque' })

    await waitFor(() => expect(getCount).toBe(1)) // hidratação inicial

    await user.click(screen.getByRole('button', { name: /atualizar lista/i }))

    await waitFor(() => expect(getCount).toBe(2))
  })
})
