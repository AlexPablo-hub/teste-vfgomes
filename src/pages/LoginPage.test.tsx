import { describe, it, expect, beforeEach, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import userEvent from '@testing-library/user-event'
import { server } from '@/test/mocks/server'
import { renderWithProviders, screen, waitFor } from '@/test/utils'
import { LoginPage } from './LoginPage'
import { setStoredToken } from '@/services/api/client'

const BASE = 'https://fakestoreapi.com'

// Mock useNavigate para inspecionar para onde a LoginPage redireciona
const navigateMock = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('LoginPage', () => {
  beforeEach(() => {
    setStoredToken(null)
    window.localStorage.clear()
    navigateMock.mockReset()
  })

  it('renderiza form com campos username, senha e botão Entrar', () => {
    renderWithProviders(<LoginPage />, { initialRoute: '/login' })

    expect(screen.getByLabelText(/usuário/i)).toBeInTheDocument()
    // Há label "Senha" (do campo) + link "Esqueceu a Senha?". Usamos o input.
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('valida campos vazios mostrando mensagens de erro inline', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />, { initialRoute: '/login' })

    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText(/informe seu usuário/i)).toBeInTheDocument()
    expect(screen.getByText(/informe sua senha/i)).toBeInTheDocument()
  })

  it('login bem-sucedido com mor_2314 redireciona (não fica mais na tela de login)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />, { initialRoute: '/login' })

    await user.type(screen.getByLabelText(/usuário/i), 'mor_2314')
    await user.type(screen.getByPlaceholderText('••••••••'), '83r5^_')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      // Após login, AuthContext fica autenticado e o componente faz <Navigate />.
      // Verificamos via localStorage que o token foi persistido.
      expect(window.localStorage.getItem('auth-token')).toMatch(/^mock-token/)
    })
  })

  it('credencial inválida exibe banner de erro com role=alert', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />, { initialRoute: '/login' })

    await user.type(screen.getByLabelText(/usuário/i), 'mor_2314')
    await user.type(screen.getByPlaceholderText('••••••••'), 'senha-errada')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/usuário ou senha inválidos/i)
    // Token NÃO deve ter sido salvo
    expect(window.localStorage.getItem('auth-token')).toBeNull()
  })

  it('falha de rede mostra erro de servidor indisponível', async () => {
    server.use(http.post(`${BASE}/auth/login`, () => HttpResponse.error()))

    const user = userEvent.setup()
    renderWithProviders(<LoginPage />, { initialRoute: '/login' })

    await user.type(screen.getByLabelText(/usuário/i), 'mor_2314')
    await user.type(screen.getByPlaceholderText('••••••••'), '83r5^_')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/indisponível/i)
  })

  it('clicar na aba Cliente apenas alterna seleção, sem preencher campos', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />, { initialRoute: '/login' })

    const clientTab = screen.getByRole('tab', { name: /cliente/i })
    await user.click(clientTab)

    // Tab fica selecionada
    expect(clientTab).toHaveAttribute('aria-selected', 'true')
    // Mas os campos NÃO são auto-preenchidos — usuário digita
    expect(screen.getByLabelText(/usuário/i)).toHaveValue('')
    expect(screen.getByPlaceholderText('••••••••')).toHaveValue('')
  })

  it('cliente que veio de /admin/* + loga via tab Cliente vai pra /products', async () => {
    // Cenário: usuário deslogado tentou acessar /admin/estoque, RequireAuth
    // mandou pra /login com state={from: '/admin/estoque'}. Cliente clica
    // a aba Cliente (não admin) e loga. NÃO pode ser levado pra área admin.
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />, {
      initialRoute: { pathname: '/login', state: { from: '/admin/estoque' } },
    })

    await user.click(screen.getByRole('tab', { name: /cliente/i }))
    await user.type(screen.getByLabelText(/usuário/i), 'kevinryan')
    await user.type(screen.getByPlaceholderText('••••••••'), 'kev02937@')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/products', { replace: true })
    })
    expect(navigateMock).not.toHaveBeenCalledWith('/admin/estoque', expect.anything())
  })

  it('admin que veio de /admin/clientes via redirect-back é levado pra lá (deep link respeitado)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />, {
      initialRoute: { pathname: '/login', state: { from: '/admin/clientes' } },
    })

    await user.click(screen.getByRole('tab', { name: /administrador/i }))
    await user.type(screen.getByLabelText(/usuário/i), 'mor_2314')
    await user.type(screen.getByPlaceholderText('••••••••'), '83r5^_')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/admin/clientes', { replace: true })
    })
  })

  // === Matriz tab × role (regra de negócio principal) ===

  it('tab Admin + credencial admin → /admin/estoque', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />, { initialRoute: '/login' })

    await user.click(screen.getByRole('tab', { name: /administrador/i }))
    await user.type(screen.getByLabelText(/usuário/i), 'mor_2314')
    await user.type(screen.getByPlaceholderText('••••••••'), '83r5^_')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/admin/estoque', { replace: true })
    })
  })

  it('tab Admin + credencial cliente → BLOQUEIA, mostra toast e NÃO navega', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />, { initialRoute: '/login' })

    await user.click(screen.getByRole('tab', { name: /administrador/i }))
    await user.type(screen.getByLabelText(/usuário/i), 'kevinryan')
    await user.type(screen.getByPlaceholderText('••••••••'), 'kev02937@')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    // Toast de erro aparece (renderizado via portal no document.body)
    expect(
      await screen.findByText(/permissão de administrador/i),
    ).toBeInTheDocument()

    // Banner inline NÃO deve aparecer — feedback é só pelo toast
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    // Não foi navegado pra lugar nenhum
    expect(navigateMock).not.toHaveBeenCalled()

    // Sessão NÃO ficou ativa (token foi limpo após o bloqueio)
    expect(window.localStorage.getItem('auth-token')).toBeNull()
    expect(window.localStorage.getItem('auth-user')).toBeNull()
  })

  it('tab Cliente + credencial cliente → /products', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />, { initialRoute: '/login' })

    await user.click(screen.getByRole('tab', { name: /cliente/i }))
    await user.type(screen.getByLabelText(/usuário/i), 'kevinryan')
    await user.type(screen.getByPlaceholderText('••••••••'), 'kev02937@')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/products', { replace: true })
    })
  })

  it('tab Cliente + credencial admin → /products (admin pode usar área cliente)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />, { initialRoute: '/login' })

    await user.click(screen.getByRole('tab', { name: /cliente/i }))
    await user.type(screen.getByLabelText(/usuário/i), 'mor_2314')
    await user.type(screen.getByPlaceholderText('••••••••'), '83r5^_')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/products', { replace: true })
    })
  })

  it('botão Entrar tem aria-busy=true durante submit', async () => {
    // Atrasa a resposta para conseguirmos observar o estado de loading
    server.use(
      http.post(`${BASE}/auth/login`, async () => {
        await new Promise((r) => setTimeout(r, 50))
        return HttpResponse.json({ token: 'tk' })
      }),
    )

    const user = userEvent.setup()
    renderWithProviders(<LoginPage />, { initialRoute: '/login' })

    await user.type(screen.getByLabelText(/usuário/i), 'mor_2314')
    await user.type(screen.getByPlaceholderText('••••••••'), '83r5^_')

    const button = screen.getByRole('button', { name: /entrar/i })
    user.click(button)

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-busy', 'true')
    })
  })
})
