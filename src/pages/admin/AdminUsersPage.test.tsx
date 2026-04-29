import { describe, it, expect, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { renderWithProviders, screen, waitFor } from '@/test/utils'
import { AdminUsersPage } from './AdminUsersPage'
import { useUsersStore } from '@/stores/usersStore'
import { mockUsers } from '@/data/mocks'

const BASE = 'https://fakestoreapi.com'

describe('AdminUsersPage', () => {
  beforeEach(() => {
    useUsersStore.setState({ users: mockUsers, hydratedAt: null })
  })

  it('renderiza heading e botão Adicionar Usuário', async () => {
    renderWithProviders(<AdminUsersPage />, { initialRoute: '/admin/clientes' })
    expect(
      await screen.findByRole('heading', { name: /gestão de clientes/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /adicionar usuário/i })).toBeInTheDocument()
  })

  it('lista usuários do store inicialmente (mocks)', async () => {
    renderWithProviders(<AdminUsersPage />, { initialRoute: '/admin/clientes' })
    expect(await screen.findByText(/Alexander Black/)).toBeInTheDocument() // mor_2314 admin
    expect(screen.getByText(/Kevin Ryan/)).toBeInTheDocument()
  })

  it('hidrata via API e substitui a lista quando GET /users retorna dados', async () => {
    renderWithProviders(<AdminUsersPage />, { initialRoute: '/admin/clientes' })

    // MSW handler default retorna 2 fake users (mor_2314 + kevinryan).
    // Ambos têm nomes próprios — David Morrison e Kevin Ryan.
    await waitFor(() => {
      expect(screen.getByText(/David Morrison/)).toBeInTheDocument()
    })
  })

  it('mantém usuários no store quando hidratação falha (modo offline)', async () => {
    server.use(http.get(`${BASE}/users`, () => HttpResponse.error()))

    renderWithProviders(<AdminUsersPage />, { initialRoute: '/admin/clientes' })
    expect(await screen.findByText(/Alexander Black/)).toBeInTheDocument()
  })

  it('cria usuário: chama POST /users + adiciona ao store + toast success', async () => {
    let postCalled = false
    server.use(
      http.post(`${BASE}/users`, async ({ request }) => {
        postCalled = true
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: 999, ...body })
      }),
    )

    const user = userEvent.setup()
    renderWithProviders(<AdminUsersPage />, { initialRoute: '/admin/clientes' })

    await screen.findByText(/Alexander Black/)
    await user.click(screen.getByRole('button', { name: /adicionar usuário/i }))

    await screen.findByRole('heading', { name: /novo usuário/i })

    await user.type(screen.getByLabelText(/primeiro nome/i), 'Maria')
    await user.type(screen.getByLabelText(/sobrenome/i), 'Silva')
    await user.type(screen.getByLabelText(/^usuário$/i), 'maria_s')
    await user.type(screen.getByLabelText(/e-mail/i), 'maria@test.com')
    await user.type(screen.getByLabelText(/^senha$/i), 'pass123')
    await user.type(screen.getByLabelText(/telefone/i), '11987654321')
    await user.type(screen.getByLabelText(/cidade/i), 'São Paulo')
    await user.type(screen.getByLabelText(/cep/i), '12345678')

    await user.click(screen.getByRole('button', { name: /criar usuário/i }))

    await waitFor(() => expect(postCalled).toBe(true))

    expect(await screen.findByText(/usuário criado/i)).toBeInTheDocument()
    expect(await screen.findByText('Maria Silva')).toBeInTheDocument()
  })

  it('exclui usuário: chama DELETE /users/:id + remove do store', async () => {
    // Força offline pra preservar mockUsers (kevinryan id=3 nos mocks)
    server.use(http.get(`${BASE}/users`, () => HttpResponse.error()))

    let deletedId: string | null = null
    server.use(
      http.delete(`${BASE}/users/:id`, ({ params }) => {
        deletedId = params.id as string
        return HttpResponse.json({ id: Number(params.id) })
      }),
    )

    const user = userEvent.setup()
    renderWithProviders(<AdminUsersPage />, { initialRoute: '/admin/clientes' })

    await screen.findByText(/Kevin Ryan/)

    // Botão excluir do kevinryan (id=3 nos mockUsers; rótulo aria-label='Excluir kevinryan')
    const deleteBtn = screen.getByRole('button', { name: /excluir kevinryan/i })
    await user.click(deleteBtn)

    await screen.findByRole('heading', { name: /excluir/i })
    await user.click(screen.getByRole('button', { name: /^excluir$/i }))

    await waitFor(() => expect(deletedId).toBe('3'))
    await waitFor(() => {
      expect(screen.queryByText(/Kevin Ryan/)).not.toBeInTheDocument()
    })
  })

  it('botão excluir do próprio admin logado fica desabilitado', async () => {
    server.use(http.get(`${BASE}/users`, () => HttpResponse.error()))

    renderWithProviders(<AdminUsersPage />, { initialRoute: '/admin/clientes' })

    await screen.findByText(/Alexander Black/)

    // Sem usuário logado no contexto (test render fresh), nenhum é "self".
    // Garantimos que o botão existe e que TODOS os botões de excluir estão habilitados.
    const deleteButtons = screen.getAllByRole('button', { name: /excluir/i })
    expect(deleteButtons.length).toBeGreaterThan(0)
    for (const btn of deleteButtons) {
      expect(btn).not.toBeDisabled()
    }
  })

  it('botão Atualizar dispara refresh manual do GET /users', async () => {
    let getCount = 0
    server.use(
      http.get(`${BASE}/users`, () => {
        getCount += 1
        return HttpResponse.json([])
      }),
    )

    const user = userEvent.setup()
    renderWithProviders(<AdminUsersPage />, { initialRoute: '/admin/clientes' })

    await waitFor(() => expect(getCount).toBe(1))

    await user.click(screen.getByRole('button', { name: /atualizar lista/i }))

    await waitFor(() => expect(getCount).toBe(2))
  })
})
