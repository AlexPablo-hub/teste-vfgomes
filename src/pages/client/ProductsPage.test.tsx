import { describe, it, expect, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen, waitFor } from '@/test/utils'
import { ProductsPage } from './ProductsPage'
import { useProductsStore } from '@/stores/productsStore'
import { useCartStore } from '@/stores/cartStore'
import type { Product } from '@/types/product'

const seedProducts: Product[] = [
  {
    id: 10,
    title: 'Camisa Linho',
    price: 250,
    description: 'desc',
    category: "men's clothing",
    image: '/x.jpg',
    rating: { rate: 4.8, count: 100 },
  },
  {
    id: 11,
    title: 'Anel Ouro',
    price: 1500,
    description: 'desc',
    category: 'jewelery',
    image: '/y.jpg',
    rating: { rate: 4.2, count: 30 },
  },
]

describe('ProductsPage', () => {
  beforeEach(() => {
    // Pré-hidrata pra que a página renderize sem depender da API real do MSW.
    useProductsStore.setState({ products: seedProducts, hydratedAt: Date.now() })
    useCartStore.getState().clear()
  })

  it('renderiza header padrão e lista os produtos do store', async () => {
    renderWithProviders(<ProductsPage />, { initialRoute: '/products' })

    expect(await screen.findByRole('heading', { name: /produtos/i })).toBeInTheDocument()
    expect(screen.getByText('Camisa Linho')).toBeInTheDocument()
    expect(screen.getByText('Anel Ouro')).toBeInTheDocument()
  })

  it('aplica categoria via URL e header reflete a escolha', async () => {
    renderWithProviders(<ProductsPage />, {
      initialRoute: { pathname: '/products', search: '?categoria=joias' },
    })

    expect(await screen.findByRole('heading', { name: /joias/i })).toBeInTheDocument()
    // Camisa some, Anel fica
    expect(screen.queryByText('Camisa Linho')).not.toBeInTheDocument()
    expect(screen.getByText('Anel Ouro')).toBeInTheDocument()
  })

  it('clicar em "Adicionar ao Carrinho" empilha no cartStore', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductsPage />, { initialRoute: '/products' })

    const addBtn = await screen.findByRole('button', {
      name: /adicionar camisa linho ao carrinho/i,
    })
    await user.click(addBtn)

    await waitFor(() => {
      expect(useCartStore.getState().items).toHaveLength(1)
    })
    expect(useCartStore.getState().items[0].product.id).toBe(10)
  })
})
