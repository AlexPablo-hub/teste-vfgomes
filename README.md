# Teste Técnico FrontEnd Junior

API utilizada para o teste: https://fakestoreapi.com/docs

Projeto em REACT com Typescript e Tailwind, deve ser criado usando a tecnologia Vite.

## Objetivo

Consumo da API Fakestore para a criação de um mini e-commerce.

#### Requisitos:

Básico:

- Autenticação e Autorização
- Separação de tipos de usuário

Usuário admin:

- Login
- CRUD dos usuários (Listagem, criação e etc)
- CRUD dos produtos (Listagem, criação e etc)

Usuário cliente:

- Login
- Listagem dos produtos
- Adicionar produtos ao carrinho, alterar quantidade, remover itens, visualizar subtotal/total e finalizar compra (mock)

Observação: A Fakestore API não salva nada, ela é apenas read-only, você ira ter que fazer as
operações normalmente como se fossem POST ou PUT mas elas não ficam salvas no Fakestore, para salvar as informações pode ser utilizado MOCK com LocalStorage.

Por padrão o Fakestore API não possui separação de usuário por role, porem, dentro da rota GET de usuários eu quero se seja simulado 2 tipos, um como administrador e o outro como cliente, para isso as seguintes contas irão ser utilizadas:

CONTA SIMULADA DE ADMIN
username: "mor*2314"
password: "83r5^*"

CONTA SIMULADA DE CLIENTE
username: "kevinryan"
password: "kev02937@"

## O que será avaliado

Para o teste técnico as seguintes caracteristicas serão avaliadas:

- Design Moderno com Animações
  - Layout responsivo (mobile, tablet, desktop)
  - Estados visuais de loading, erro e vazio
  - Feedback visual em interações (hover, active, transições suaves)
  - Acessibilidade básica (labels, alt em imagens, foco visível)
- Consumo de API e Tipagem Typescript
- Estruturação de pastas e arquivos (components, pages, services, hooks)
- Contexto do React (Context API)
- Layout Responsivo
- Commits GIT

## Diferencial

Requisitos diferenciais:

- Vitest
- Uso de ferramentas de contexto (Zustand, Redux)
- Prototipação (Figma)
- Tratamento avançado de erros

## Entrega

Para a entrega deve estar tudo dentro de um repositório público do GitHub, commits devem
ser incrementais (não só um commit "primeira versão"). Deve-se enviar o link do repositório como resposta ao email do teste técnico.

**Prazo**: Teste deve ser enviado até a data 29/04/2026 (Quarta) as 20:00h (horário MT).

## Informações do Sistema.

## Como baixar, instalar e rodar

Pré-requisitos: **Node.js 18+** e **npm**.

```bash
git clone <url-do-repositorio>
cd "Tesde vfgomes"
npm install
```

Scripts disponíveis (em `package.json`):

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o Vite em `http://localhost:5173` |
| `npm run build` | Type-check (`tsc -b`) + build de produção em `dist/` |
| `npm run preview` | Serve o build local pra validar antes do deploy |
| `npm run lint` | ESLint em todo o projeto |
| `npm test` | Roda a suíte Vitest uma vez (CI) |
| `npm run test:watch` | Vitest em watch (re-roda ao salvar) |
| `npm run test:ui` | Dashboard visual do Vitest |

**Contas para testar** (como definido no enunciado):

- Admin → `mor_2314` / `83r5^_` → redireciona para `/admin/estoque`
- Cliente → `kevinryan` / `kev02937@` → redireciona para `/products`

## Estrutura

```
src/
├── App.tsx               // Provider tree (AuthProvider + Router) + ErrorBoundary
├── main.tsx              // Entry point Vite
├── routes.tsx            // Rotas + RequireAuth/RequireRole
├── index.css             // Tokens NOIR_LUXE + base Tailwind 4
├── components/
│   ├── ui/               // Button, Input, Select, Modal, Toast, EmptyState…
│   ├── layout/           // Header, AdminLayout (sidebar fixa + topbar)
│   ├── admin/            // ConfirmDialog, badges
│   └── cart/             // CartSummary, CartItem
├── pages/
│   ├── LoginPage.tsx     // Tabs Admin/Cliente, validação cruzada com role
│   ├── admin/
│   │   ├── AdminProductsPage.tsx   // /admin/estoque
│   │   └── AdminUsersPage.tsx      // /admin/clientes
│   └── client/           // ProductsPage, ProductDetailPage, CartPage, CheckoutPage…
├── contexts/
│   └── AuthContext.tsx   // user/role/login/logout + reset de stores no logout
├── hooks/
│   ├── useAuth.ts                  // selector do AuthContext
│   ├── useDocumentTitle.ts         // <title> dinâmico por rota
│   ├── useHydrateProducts.ts       // GET /products + cache por sessão
│   ├── useHydrateUsers.ts          // GET /users + merge com locais
│   └── useInfiniteScroll.ts        // IntersectionObserver para rolagem infinita
├── services/             // Camada axios (auth.service, products.service, users.service)
├── stores/               // Zustand persist (cartStore, productsStore, usersStore, toastStore)
├── lib/
│   ├── api.ts            // Axios instance + interceptor de erros
│   ├── errors.ts         // AppError → ApiError / AuthError / NetworkError / ValidationError
│   ├── format.ts         // formatBRL, maskBRL/parseBRL, maskPhoneBR, maskCEP, isValidEmail
│   ├── motion.ts         // Variants Framer Motion (fadeIn, slideUp, easeLuxe)
│   ├── toast.ts          // toast.success/error/info/warning
│   └── cn.ts             // clsx + tailwind-merge
├── data/mocks.ts         // Catálogo NOIR_LUXE + categoryLabels (PT-BR)
├── test/
│   ├── setup.ts          // MSW lifecycle + stubs (IntersectionObserver)
│   ├── utils.tsx         // renderWithProviders helper
│   └── mocks/            // MSW handlers + server
└── types/                // user.ts, product.ts (+ helpers stockStatus, formatSku)
```

## Stack utilizada

- **React 18 + TypeScript strict** — base do projeto, sem `any` no código de aplicação
- **Vite 5** — bundler/dev server
- **Tailwind 4** com CSS variables (`@theme`) — design tokens NOIR_LUXE
- **Framer Motion 12** — animações (variants `fadeIn`/`slideUp`/`staggerContainer`, easing luxe)
- **React Router 6** — `createBrowserRouter` + guards declarativos (`RequireAuth`, `RequireRole`)
- **Zustand 5 com `persist`** — `cartStore`, `productsStore`, `usersStore`, `toastStore` em `localStorage`
- **Axios** — instance com interceptor que mapeia `AxiosError` para classes tipadas (`ApiError`, `NetworkError`, `AuthError`, `ValidationError`)
- **Lucide React** — ícones
- **Vitest + Testing Library + MSW + jsdom** — 127 testes (unitários, services, páginas) com mock HTTP em camada de rede
- **ESLint + tsc strict** — guarda-rails de qualidade

Decisões transversais:

- **Hidratação uma vez por sessão** — após o primeiro `GET` da Fakestore, alterações locais (criar/editar/excluir) **não são apagadas** em refreshes do browser. Só o `logout` reseta os stores.
- **Merge na hidratação** (apenas `users`) — usuários locais cuja `username` não vem da API são preservados, evitando que CRUDs sumam (a Fakestore retorna `id` mas não persiste de fato).
- **Refresh manual** (botão "Atualizar") — força um refetch e mostra `Skeleton` enquanto a request voa.
- **Tratamento de erros** — `ErrorBoundary` global + classes tipadas + toasts diferenciados por tipo de erro.

## Tecnologias e ferramentas por página

### `/login` — [src/pages/LoginPage.tsx](src/pages/LoginPage.tsx)

Porta de entrada da aplicação. Hero NOIR_LUXE à esquerda, formulário à direita.

| Recurso | Implementação |
|---|---|
| Layout responsivo | Tailwind breakpoints `sm`/`md`/`lg` com hero ocultado em mobile |
| Animações | Framer Motion — `staggerContainer` no hero + form, `staggerItem` em cada bloco; easing `cubic-bezier(0.16,1,0.3,1)` |
| Tabs Admin/Cliente | Pattern `role="tablist"` com `aria-selected` |
| Loading | Botão Entrar com `Loader2` (spinner Lucide) + `aria-busy` |
| Erro 401 | Banner inline com `role="alert"` |
| Erro de rede / role inválida | Toast vermelho via `toast.error()` |
| Validação tab × role | Matriz declarativa: tab Admin com user cliente bloqueia o login com mensagem específica |
| Acessibilidade | Labels `htmlFor/id`, `aria-invalid`, `aria-describedby`, foco visível com `focus:ring` |
| Persistência | `AuthContext` salva `AuthUser` em `localStorage` (chave `auth-user`) |
| Redirect seguro | Volta para `from` apenas se a role do user permite — caso contrário, vai pro fallback da role |
| Document title | `useDocumentTitle('Login')` |
| Testes | Cobertura: 401, network error, bloqueio admin, redirect-back contra escalonamento |

### `/admin/clientes` — [src/pages/admin/AdminUsersPage.tsx](src/pages/admin/AdminUsersPage.tsx)

CRUD completo de usuários integrado à Fakestore.

| Recurso | Implementação |
|---|---|
| Hidratação | `useHydrateUsers` — `GET /users` uma vez por sessão; merge por username preserva criados localmente |
| Estado global | `useUsersStore` (Zustand persist) com `add/update/remove/setAll/reset` |
| Service | `users.service.ts` — `list/getById/create/update/remove` com adapter da Fakestore para o domínio (resolve `role` por username) |
| Busca | Filtro client-side por nome, username ou e-mail |
| Filtro de Papel | `<Select>` com opções Todos/Admin/Cliente, AND com a busca |
| Rolagem infinita | `useInfiniteScroll` com IntersectionObserver — sentinel `<tr>` no fim da `<tbody>`, carrega 8 por vez |
| Modal Criar/Editar | `<Modal>` com `<form>` + validação completa |
| Validação | E-mail (`isValidEmail`), telefone BR (10 ou 11 dígitos descartando `+55`), CEP (8 dígitos), cidade, username único |
| Máscara em inputs | `maskPhoneBR` (progressivo, idempotente, descarta US `1-XXX-XXX-XXXX`), `maskCEP` |
| Confirmação de exclusão | `ConfirmDialog` (variante destructive) com loading no submit |
| Otimistic updates | Mutação local imediata + chamada API em paralelo, com toast diferenciado por tipo de erro |
| Skeleton | Mostra `SkeletonRow` em primeira hidratação OU enquanto botão "Atualizar" está em voo |
| Self-protection | Botão Excluir do próprio admin logado fica `disabled` |
| Document title | `useDocumentTitle('Admin - Clientes')` |
| Testes | Cobertura: hidratação, criar com POST, excluir com DELETE, refresh manual, modo offline |

### `/admin/estoque` — [src/pages/admin/AdminProductsPage.tsx](src/pages/admin/AdminProductsPage.tsx)

CRUD de produtos com filtros avançados, ordenação e exportação.

| Recurso | Implementação |
|---|---|
| Hidratação | `useHydrateProducts` — `GET /products` uma vez por sessão |
| Estado global | `useProductsStore` (Zustand persist) |
| Service | `products.service.ts` — adapter mantém categoria como slug Fakestore + label PT-BR via `categoryLabels` |
| Coluna Avaliação | `rating.rate` + `rating.count` da API com ícone `Star` |
| Coluna Status | `stockStatus(p)` local (in-stock / low / out) — informativa, sem filtro |
| Modal de Filtrar | Categoria (4 da Fakestore) + Avaliação mínima (1★ a 4★) + faixa de preço (`maskBRL`/`parseBRL`) |
| Tags de filtros ativos | Chips removíveis abaixo da toolbar com X individual + "Limpar tudo" |
| Ordenação por Preço | Header clicável alterna `null → asc → desc → null`, `aria-sort` p/ acessibilidade |
| Busca | Filtro client-side por título, categoria ou SKU |
| Rolagem infinita | Mesmo `useInfiniteScroll` da Users, carrega 8 por vez |
| Animações por linha | `motion.tr` com delay escalonado (luxe ease-out) |
| Modal Criar/Editar | Form completo com validação (título, preço > 0, descrição, categoria, estoque) |
| Otimistic updates | Mutação local + chamada API em paralelo + toast diferenciado |
| Skeleton | Mesma estratégia da Users (primeira hidratação OU refresh manual) |
| Exportar CSV | Gera CSV com `SKU, Título, Categoria, Preço, Estoque` e aciona download |
| Document title | `useDocumentTitle('Admin - Estoque')` |
| Testes | Cobertura: hidratação, busca, criar com POST, excluir com DELETE, refresh manual, modo offline |
