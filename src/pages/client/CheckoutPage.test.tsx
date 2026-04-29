import { describe, it, expect, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen, waitFor } from '@/test/utils'
import { CheckoutPage } from './CheckoutPage'
import { useCartStore } from '@/stores/cartStore'
import type { Product } from '@/types/product'

const product: Product = {
  id: 1,
  title: 'Anel Ouro',
  price: 1500,
  description: 'desc',
  category: 'jewelery',
  image: '/y.jpg',
  rating: { rate: 4.2, count: 30 },
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    useCartStore.getState().clear()
    useCartStore.getState().add(product, 1)
    sessionStorage.clear()
  })

  it('redireciona para /products quando o carrinho está vazio', () => {
    useCartStore.getState().clear()
    renderWithProviders(<CheckoutPage />, { initialRoute: '/checkout' })
    // Página não renderiza heading porque <Navigate> é aplicado.
    expect(screen.queryByRole('heading', { name: /finalizar compra/i })).not.toBeInTheDocument()
  })

  it('valida e-mail no submit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CheckoutPage />, { initialRoute: '/checkout' })

    // Preenche tudo menos email
    await user.type(screen.getByLabelText(/nome completo/i), 'Maria Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'sem-arroba')
    await user.type(screen.getByLabelText(/cep/i), '12345678')
    await user.type(screen.getByLabelText(/^rua$/i), 'Av Paulista')
    await user.type(screen.getByLabelText(/^número$/i), '100')
    await user.type(screen.getByLabelText(/cidade/i), 'São Paulo')

    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }))

    expect(await screen.findByText(/e-mail inválido/i)).toBeInTheDocument()
  })

  it('valida CEP incompleto no submit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CheckoutPage />, { initialRoute: '/checkout' })

    await user.type(screen.getByLabelText(/nome completo/i), 'Maria Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'maria@test.com')
    await user.type(screen.getByLabelText(/cep/i), '123')
    await user.type(screen.getByLabelText(/^rua$/i), 'Av Paulista')
    await user.type(screen.getByLabelText(/^número$/i), '100')
    await user.type(screen.getByLabelText(/cidade/i), 'São Paulo')

    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }))

    expect(await screen.findByText(/cep precisa ter 8 dígitos/i)).toBeInTheDocument()
  })

  it('persiste pedido em sessionStorage ao confirmar com sucesso', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CheckoutPage />, { initialRoute: '/checkout' })

    await user.type(screen.getByLabelText(/nome completo/i), 'Maria Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'maria@test.com')
    await user.type(screen.getByLabelText(/cep/i), '12345678')
    await user.type(screen.getByLabelText(/^rua$/i), 'Av Paulista')
    await user.type(screen.getByLabelText(/^número$/i), '100')
    await user.type(screen.getByLabelText(/cidade/i), 'São Paulo')

    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }))

    await waitFor(() => {
      const stored = sessionStorage.getItem('last-order')
      expect(stored).not.toBeNull()
    })
    const stored = JSON.parse(sessionStorage.getItem('last-order') ?? '{}')
    expect(stored.items).toHaveLength(1)
    expect(stored.subtotal).toBe(1500)
  })
})
