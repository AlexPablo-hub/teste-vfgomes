# NOIR LUXE

Um mini e-commerce que eu montei em alguns fins de semana pra brincar com a stack que eu vinha querendo testar há um tempo: **React 18 + TypeScript strict + Tailwind 4 + Zustand 5 + Framer Motion 12**, com **Vitest** e **Playwright** em cima.

A premissa foi simples: pegar a [Fakestore API](https://fakestoreapi.com) (que é read-only e meio limitada) e tentar fazer ela parecer uma loja "viva" — com painel admin que cria/edita produtos, loja do cliente que reflete tudo em outra aba sem refresh, carrinho, favoritos, checkout e comprovante imprimível. O nome "NOIR LUXE" veio da identidade visual que acabou saindo no Figma: violeta + preto + serifa.

## Links

- 🚀 **App publicado**: <https://noirlux-ecommerce.vercel.app>
- 🎨 **Protótipo no Figma**: <https://www.figma.com/community/file/1630765064447318545>

**Contas pra testar** (são contas reais da Fakestore — escolhi duas que dão pra distinguir admin e cliente):

- Admin → `mor_2314` / `83r5^_` → cai em `/admin/estoque`
- Cliente → `kevinryan` / `kev02937@` → cai em `/products`

## Funcionalidades

| Feature | O que faz | Onde |
|---|---|---|
| ❤️ **Favoritos** | Wishlist completa (toggle no card, drawer próprio, mover ao carrinho), persistente e sincronizada entre abas | [favoritesStore](src/stores/favoritesStore.ts) + [FavoritesDrawer](src/components/favorites/FavoritesDrawer.tsx) |
| 🔁 **Cross-tab sync** | Criar/editar/excluir em uma aba (admin) reflete em ~50ms em outra aba (loja) sem refresh, via evento `storage` do browser | [useCrossTabSync](src/hooks/useCrossTabSync.ts) |
| 🔗 **URL como fonte dos filtros** | `/products?categoria=joias&ordenar=mais-avaliados` permite bookmark, share e back/forward do browser | [ProductsPage](src/pages/client/ProductsPage.tsx) |
| ♾️ **Rolagem infinita** | IntersectionObserver com sentinel `<tr>`/`<div>`, carrega 8 por vez. Aplicado nas 3 listas (admin produtos, admin usuários, loja) | [useInfiniteScroll](src/hooks/useInfiniteScroll.ts) |
| 🖨️ **Comprovante imprimível** | `/checkout/sucesso` tem `@media print` com fundo branco, cards sem sombra, `print:hidden` em botões/footer | [CheckoutSuccessPage](src/pages/client/CheckoutSuccessPage.tsx) |
| 🔄 **F5 sobrevive em /checkout/sucesso** | Pedido salvo em `sessionStorage` antes do redirect; página lê do `location.state` ou cai no storage | [CheckoutPage](src/pages/client/CheckoutPage.tsx) |
| 🎨 **Galeria de imagens no admin** | Modal secundário com grid de URLs únicas extraídas dos produtos atuais, contornando a limitação da Fakestore (não tem upload) | [AdminProductsPage](src/pages/admin/AdminProductsPage.tsx) |
| 📱 **Máscaras BR** | Telefone (`+55 XX XXXXX-XXXX`, descarta US), CEP (`XX.XXX-XXX`), moeda (`R$ 1.500,00`) — todas progressivas e idempotentes | [lib/format.ts](src/lib/format.ts) |
| 🚀 **Deploy automático** | Vercel via push pra `master` + SPA fallback explícito (`vercel.json`) | <https://noirlux-ecommerce.vercel.app> |
| 🎯 **404 estilizada** | Página dedicada com identidade NOIR LUXE, 404 gigante com glow violeta animado | [NotFoundPage](src/pages/NotFoundPage.tsx) |
| 🪟 **Header dinâmico** | Em `/checkout/sucesso` o header global vira *minimal* (só wordmark central) pra não tentar o usuário a sair do comprovante | [Header](src/components/layout/Header.tsx) |
| 🌐 **"Ver na loja" no admin** | Botão `<a target="_blank">` aproveita a hierarquia admin → client; admin abre a loja em nova aba sem refazer login | [AdminProductsPage](src/pages/admin/AdminProductsPage.tsx) |
| ✅ **CI GitHub Actions** | Type-check → lint → 147 testes Vitest → build → Chromium → ~30 specs Playwright E2E em todo push | [.github/workflows/ci.yml](.github/workflows/ci.yml) |
| 🧪 **E2E com Playwright** | 6 specs cobrindo auth, fluxo de compra, favoritos, CRUDs admin, navegação 404 | [e2e/](e2e/) |
| 🎭 **Document title dinâmico** | `<title>` muda por rota (admin pages, login, e por categoria em /products) | [useDocumentTitle](src/hooks/useDocumentTitle.ts) |
| 🍞 **Sistema de toast NOIR LUXE** | 4 variantes (success/error/info/warning) com auto-dismiss e store próprio | [toastStore](src/stores/toastStore.ts) |

## Como rodar localmente

Pré-requisitos: **Node.js 18+** e **npm**.

```bash
git clone https://github.com/AlexPablo-hub/noirlux-ecommerce
cd noirlux-ecommerce
npm install
npm run dev
```

Scripts disponíveis (em `package.json`):

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o Vite em `http://localhost:5173` |
| `npm run build` | Type-check (`tsc -b`) + build de produção em `dist/` |
| `npm run preview` | Serve o build local pra validar antes do deploy |
| `npm test` | Roda a suíte Vitest uma vez (CI) |
| `npm run test:watch` | Vitest em watch (re-roda ao salvar) |
| `npm run test:ui` | Dashboard visual do Vitest |
| `npm run test:e2e` | Roda a suíte **Playwright** end-to-end (sobe o build + 6 specs) |
| `npm run test:e2e:ui` | Dashboard visual do Playwright (debug) |

## CI

Workflow GitHub Actions em [.github/workflows/ci.yml](.github/workflows/ci.yml) — roda em todo `push` e `pull_request` na `master`:

- **Job `unit`** — type-check (`tsc -b`) → Vitest (147 testes) → build de produção
- **Job `e2e`** — depende do `unit` passar; instala Chromium + roda Playwright (specs em `e2e/`)

Quando algum spec E2E falha, o report HTML é exportado como artifact `playwright-report` (mantido por 7 dias) — facilita ver screenshots e traces direto no GitHub.

## Estrutura

```
src/
├── App.tsx               // Provider tree (AuthProvider + Router) + ErrorBoundary + cross-tab sync
├── main.tsx              // Entry point Vite
├── routes.tsx            // Rotas + RequireAuth/RequireRole
├── index.css             // Tokens NOIR LUXE + base Tailwind 4
├── components/
│   ├── ui/               // Button, Input, Select, Modal, Toast, EmptyState…
│   ├── layout/           // Header (com modo minimal por rota), AdminLayout
│   ├── admin/            // ConfirmDialog, badges
│   ├── cart/             // CartSummary, CartDrawer
│   ├── favorites/        // FavoritesDrawer
│   └── product/          // ProductCard, ProductCardSkeleton
├── pages/
│   ├── LoginPage.tsx               // Tabs Admin/Cliente, validação cruzada com role
│   ├── NotFoundPage.tsx            // 404 com identidade NOIR LUXE
│   ├── admin/
│   │   ├── AdminProductsPage.tsx   // /admin/estoque
│   │   └── AdminUsersPage.tsx      // /admin/clientes
│   └── client/
│       ├── ProductsPage.tsx        // /products  (categoria + faixa preço + avaliação + ordenação)
│       ├── ProductDetailPage.tsx   // /products/:id
│       ├── CheckoutPage.tsx        // /checkout
│       └── CheckoutSuccessPage.tsx // /checkout/sucesso
├── contexts/
│   └── AuthContext.tsx   // user/role/login/logout + reset de stores no logout
├── hooks/
│   ├── useAuth.ts                  // selector do AuthContext
│   ├── useDocumentTitle.ts         // <title> dinâmico por rota
│   ├── useHydrateProducts.ts       // GET /products — uma vez por sessão
│   ├── useHydrateUsers.ts          // GET /users  — uma vez por sessão + merge com locais
│   ├── useInfiniteScroll.ts        // IntersectionObserver para rolagem infinita
│   └── useCrossTabSync.ts          // Sincroniza Zustand stores entre abas (storage event)
├── services/             // Camada axios (auth.service, products.service, users.service)
├── stores/               // Zustand persist
│   ├── cartStore.ts                // Carrinho (add/remove/qty/subtotal)
│   ├── productsStore.ts            // Catálogo (CRUD local + hidratação API)
│   ├── usersStore.ts               // Usuários admin (CRUD local + merge API)
│   ├── favoritesStore.ts           // Wishlist do cliente
│   └── toastStore.ts               // Sistema de toast NOIR LUXE
├── lib/
│   ├── api.ts            // Axios instance + interceptor de erros
│   ├── errors.ts         // AppError → ApiError / AuthError / NetworkError / ValidationError
│   ├── format.ts         // formatBRL, maskBRL/parseBRL, maskPhoneBR, maskCEP, isValidEmail
│   ├── motion.ts         // Variants Framer Motion (fadeIn, slideUp, easeLuxe…)
│   ├── toast.ts          // toast.success/error/info/warning
│   └── cn.ts             // clsx + tailwind-merge
├── data/mocks.ts         // categoryLabels (PT-BR) + mockUsers (seed do usersStore)
├── test/
│   ├── setup.ts          // MSW lifecycle + stubs (IntersectionObserver)
│   ├── utils.tsx         // renderWithProviders helper
│   └── mocks/            // MSW handlers + server
└── types/                // user.ts, product.ts, cart.ts (+ helpers stockStatus, formatSku)
```

## Stack

- **React 18 + TypeScript strict** — base do projeto, sem `any` no código de aplicação
- **Vite 5** — bundler/dev server
- **Tailwind 4** com CSS variables (`@theme`) — design tokens NOIR LUXE
- **Framer Motion 12** — animações (variants `fadeIn`/`slideUp`/`staggerContainer`, easing luxe)
- **React Router 6** — `createBrowserRouter` + guards declarativos (`RequireAuth`, `RequireRole`)
- **Zustand 5 com `persist`** — `cartStore`, `productsStore`, `usersStore`, `favoritesStore`, `toastStore` em `localStorage`
- **Axios** — instance com interceptor que mapeia `AxiosError` para classes tipadas (`ApiError`, `NetworkError`, `AuthError`, `ValidationError`)
- **Lucide React** — ícones
- **Vitest + Testing Library + MSW + jsdom** — **147 testes** (unit, services, stores, páginas admin e cliente) com mock HTTP em camada de rede

## Decisões transversais

Algumas decisões que afetam o app inteiro e que vale registrar:

- **Hidratação uma vez por sessão** — depois do primeiro `GET` da Fakestore, alterações locais (criar/editar/excluir) **não são apagadas** em refreshes do browser. Só o `logout` reseta os stores.
- **Merge na hidratação** (apenas `users`) — usuários locais cuja `username` não vem da API são preservados, evitando que CRUDs sumam (a Fakestore retorna `id` mas não persiste de fato).
- **Cross-tab sync** ([useCrossTabSync](src/hooks/useCrossTabSync.ts)) — `window` ouve o evento `storage` e re-hidrata os stores das outras abas. Criar produto no admin reflete na loja em ~50ms sem refresh.
- **URL como fonte de verdade dos filtros do cliente** — `/products?categoria=eletronicos&ordenar=menor-preco` permite bookmark, share e back/forward do browser.
- **Refresh manual** (botão "Atualizar") — força um refetch e mostra `Skeleton` enquanto a request voa.
- **Tratamento de erros** — `ErrorBoundary` global + classes tipadas + toasts diferenciados por tipo de erro.
- **Header dinâmico por rota** — em `/checkout/sucesso` o header global vira *minimal* (apenas wordmark central), removendo carrinho/favoritos/usuário pra não tentar o usuário a sair do comprovante.

## Como cada página foi montada

### `/login` — [src/pages/LoginPage.tsx](src/pages/LoginPage.tsx)

Porta de entrada da aplicação. NOIR LUXE à esquerda, formulário à direita.

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
| Animações por linha | `motion.tr` com delay relativo ao batch (`i % PAGE_SIZE * 0.09`) — evita acúmulo na rolagem infinita |
| Modal Criar/Editar | Form completo com validação (título, preço > 0, descrição, categoria, estoque); URL da imagem inicia vazia |
| Galeria de imagens | Botão "Escolher na galeria" abre **modal secundário** (`size="lg"`) com grid de thumbnails únicas extraídas dos produtos atuais (API + locais), via `availableImages = Set(products.map(p.image))`. Selecionada destaca com badge e fecha automaticamente |
| Otimistic updates | Mutação local + chamada API em paralelo + toast diferenciado |
| Skeleton | Mesma estratégia da Users (primeira hidratação OU refresh manual) |
| Exportar CSV | Gera CSV com `SKU, Título, Categoria, Preço, Estoque` e aciona download |
| "Ver na loja" | Botão `<a target="_blank">` ao lado de "Adicionar Produto" abre `/products` em nova aba mantendo a sessão (admin tem hierarquia sobre rotas de cliente) |
| Document title | `useDocumentTitle('Admin - Estoque')` |
| Testes | Cobertura: hidratação, busca, criar com POST, excluir com DELETE, refresh manual, modo offline |

### `/products` — [src/pages/client/ProductsPage.tsx](src/pages/client/ProductsPage.tsx)

Catálogo do cliente com filtros, ordenação e rolagem infinita.

| Recurso | Implementação |
|---|---|
| Hidratação | `useHydrateProducts` — `GET /products` uma vez por sessão |
| Estado global | `useProductsStore` (Zustand persist), compartilhado com `/admin/estoque` |
| Header dinâmico por categoria | Mapa `categoryHeaders` muda título + descrição + `<title>` quando o usuário escolhe uma categoria. Animado com `key={header.title}` (motion.h1) |
| URL sincronizada | `useSearchParams` + helper `updateParam` mantém categoria e ordenação na URL: `/products?categoria=joias&ordenar=mais-avaliados` |
| Filtros (sidebar desktop) | Categorias com contador, faixa de preço (range com bounds derivados de `products`), avaliação mínima (1★ a 4★) |
| Filtros (mobile/tablet) | Botão "Filtros" com badge de filtros ativos abre o **mesmo `<FiltersPanel>`** dentro de um `<Modal>` — mesma UX em qualquer tela |
| Ordenação | Dropdown com Recomendados / Menor preço / Maior preço / Melhor avaliados; sincronizado na URL via `?ordenar=` |
| Badge nos cards | `getProductBadge(p)` derivado de dados reais (`rating.rate ≥ 4.7` → "TOP RATED", `rating.count ≥ 300` → "BEST SELLER") |
| Rolagem infinita | `useInfiniteScroll` com sentinel `<div>` no rodapé. Carrega `PAGE_SIZE = 8` por vez. Reset ao mudar filtro |
| Loading | `ProductCardSkeleton` ×8 enquanto a hidratação inicial roda |
| Erro | `EmptyState` "Falha ao carregar produtos" + botão "Tentar novamente" (só quando store fica vazio) |
| Vazio (filtros zeram) | `EmptyState` com botão "Limpar filtros" |
| Cards alinhados | Título com `line-clamp-2 min-h-[40px]` — mesma altura mesmo com nomes curtos |
| Animações | `fadeIn` no container, `slideInLeft` na sidebar, `staggerContainerSlow + staggerItem` nos cards |
| Document title | `NOIR LUXE` (default) ou `NOIR - {Categoria}` |
| Testes | Cobertura: hidratação, filtro por categoria via URL, adicionar ao carrinho |

### `/products/:id` — [src/pages/client/ProductDetailPage.tsx](src/pages/client/ProductDetailPage.tsx)

Detalhe do produto com specs derivadas da API e produtos relacionados.

| Recurso | Implementação |
|---|---|
| Botão Voltar | `<Link to="/products">` com `ArrowLeft` no topo direito (acima da imagem) |
| Imagem | `object-contain` em fundo branco para preservar produtos da Fakestore (que têm fundo transparente) |
| Specs Técnicas | Tabela gerada dinamicamente com Categoria, Avaliação (`rate / count`), Estoque, SKU, Preço, Descrição — tudo da API |
| Adicionar ao carrinho | Botão CTA com transição "Adicionado ao carrinho" + `Check` por 1.6s |
| Favoritos | `Heart` conectado ao `favoritesStore` via `toggleFavorite(product)` (não mais `useState` local) |
| Cards relacionados | Grid 2/4 colunas, com `key={id}` para re-animar a cada navegação. `useEffect` faz `scrollTo({ top: 0 })` ao trocar de produto |
| Loading | `ProductDetailSkeleton` exibido enquanto `hydrating && !product` — só redireciona a `/products` quando a hidratação termina e o produto realmente não existe |
| Animações | `staggerContainer + staggerItem` no header, `zoomIn` na imagem, `revealUp` nas seções, scroll-to-top no `id` change |
| Cards alinhados | Mesmo padrão de `min-h-[48px]` no título dos relacionados |
| Document title | Herda do header global |
| Testes | Cobertura indireta via `cartStore.test` (add) e `favoritesStore.test` (toggle) |

### `/checkout` — [src/pages/client/CheckoutPage.tsx](src/pages/client/CheckoutPage.tsx)

Formulário de finalização com validação completa, pré-preenchido pelo `AuthUser`.

| Recurso | Implementação |
|---|---|
| Form sections | Dados pessoais, Endereço de entrega, Pagamento — em `<motion.section>` com stagger |
| Pré-preenchimento | Nome/email/CEP/rua/número/cidade vêm de `useAuth().user` — admin/cliente entram com dados já mockados pela Fakestore |
| Validação | `FieldErrors` cobre: nome (≥3 chars), e-mail (`isValidEmail`), CEP (8 dígitos), rua, número, cidade. Erro do campo limpa enquanto o usuário digita |
| Máscaras | `maskCEP` no campo CEP (progressivo, idempotente). Número aceita só dígitos via `replace(/\D/g, '')` |
| Pagamento | Pix ou Boleto (cartão removido, sem dados sensíveis no mock) |
| Loading | `loading={submitting}` no Button, simula 800ms de processamento |
| Erro | Toast vermelho "Verifique os dados antes de confirmar o pedido" + erros inline |
| Vazio | `<Navigate to="/products">` quando carrinho vazio (com guarda `finalizing` pra não interferir no submit) |
| Frete consistente | Mesma fórmula do `CartSummary` (`subtotal > 200 ? 0 : 19.9`) — passa `shipping` adiante pra `/checkout/sucesso` |
| Persistência do pedido | `sessionStorage.setItem('last-order', ...)` no submit — sobrevive a F5 na página de sucesso |
| Animações | `fadeIn` no container, `slideUp` no header, `staggerContainer + staggerItem` nas seções |
| Acessibilidade | Inputs com label/`aria-invalid`/`aria-describedby` (via componente `<Input>`), `noValidate` no form |
| Testes | Cobertura: redirect com cart vazio, validação de e-mail, validação de CEP incompleto, persistência em sessionStorage |

### `/checkout/sucesso` — [src/pages/client/CheckoutSuccessPage.tsx](src/pages/client/CheckoutSuccessPage.tsx)

Comprovante do pedido — também imprimível.

| Recurso | Implementação |
|---|---|
| Header minimal | Detectado por `Header` via `isMinimalRoute` — apenas wordmark central, sem cart/favoritos/user |
| Render do estado | `location.state` (caso normal) com fallback para `sessionStorage.last-order` (sobrevive a F5) |
| Resumo | Itens com categoria + Edição NOIR LUXE como meta, qty única à direita, totais |
| Frete | Render condicional Grátis (verde) ou valor formatado |
| Animações | `scaleIn` no checkmark com pulse de glow violeta, `slideUp` no resumo, `staggerItem` nos itens |
| Comprovante imprimível | `print:hidden` nos botões e footer, `<style>{@media print}</style>` força fundo branco / texto escuro / cards sem sombra |
| Footer | Copyright + links Privacy/Terms/Shipping/Returns, escondido na impressão |
| Document title | Herda do header global (que mostra "NOIR LUXE" no minimal) |
| Sem state? | Redireciona pra `/products` se nem `location.state` nem `sessionStorage` retornarem nada |

### Carrinho — [CartDrawer.tsx](src/components/cart/CartDrawer.tsx) + [cartStore.ts](src/stores/cartStore.ts)

| Recurso | Implementação |
|---|---|
| Estado | Zustand persist (`fakestore-cart`) — `add` incrementa se já existe; `increment`, `decrement` (remove em qty 1), `setQuantity`, `remove`, `clear`, `subtotal` |
| Badge no header | `items.length` (produtos distintos, não soma de qty) |
| UI | Drawer lateral 440px (full-screen mobile), `AnimatePresence` para entrada/saída suave |
| Categoria do item | `categoryLabels[product.category]` |
| Acessibilidade | `role="dialog"`, `aria-modal`, ESC fecha, scroll-lock no body |
| Testes | 9 unit + 4 specs E2E |

### Favoritos — [FavoritesDrawer.tsx](src/components/favorites/FavoritesDrawer.tsx) + [favoritesStore.ts](src/stores/favoritesStore.ts)

| Recurso | Implementação |
|---|---|
| Estado | Zustand persist (`fakestore-favorites`) — guarda `Product` inteiro pra que o drawer mostre nome/preço/imagem mesmo se o produto sumir do catálogo |
| Operações | `toggle`, `isFavorite`, `remove`, `clear` |
| Sincronização do coração | Conectado ao store em `ProductCard`, `RelatedCard` e `ProductDetailPage` — clicar em qualquer um reflete em todos |
| Mover ao carrinho | Botão dedicado no drawer dispara `cartStore.add(product, 1)` + toast |
| Testes | 5 unit + 3 specs E2E |

## Por que as tabelas do admin rolam horizontalmente em mobile

As páginas administrativas (`/admin/clientes` e `/admin/estoque`) usam **rolagem horizontal** (`overflow-x-auto` + `min-w-[680px]/[800px]`) em telas pequenas, em vez de transformar a tabela em cards verticais empilhados como acontece nas páginas voltadas para o cliente.

Foi uma escolha deliberada, por 3 motivos:

1. **Densidade de informação > legibilidade casual.** O painel admin existe pra comparar muitas linhas em um único campo de visão (preços, estoques, papéis). Quando a tabela vira card vertical em mobile, cada produto ocupa a tela inteira e o admin perde a capacidade de comparar 8 itens de uma vez — que é exatamente o motivo da existência da tela.

2. **Público-alvo.** Quem usa CRUD de catálogo trabalha em desktop ou tablet em horizontal — não no celular durante o trânsito. O cliente final usa mobile (e por isso a `/products`, `/cart` e `/checkout` são totalmente responsivas com cards/grid). Replicar a mesma estratégia mobile-first em ambos os contextos otimizaria o caso errado.

3. **Manutenção das colunas críticas em proporção fixa.** A tabela de estoque tem 7 colunas (imagem, título, categoria, preço, avaliação, status, ações), todas com largura mínima sensível. Se cada linha virasse um card empilhado, perderíamos o alinhamento vertical (ex: comparar preços de produtos consecutivos), que é a leitura natural num CRUD.

A toolbar acima da tabela (busca, filtros, atualizar) **é** totalmente responsiva (`flex-col sm:flex-row`), assim como modais, headers e o sidebar. A rolagem horizontal afeta apenas o `<table>` propriamente, e ela tem indicador visual (a barra de rolagem nativa do browser) deixando claro que há mais conteúdo lateral.

## Como simular uma "loja viva" com uma API read-only

A Fakestore API é read-only — `POST /products` retorna id falso e descarta o payload. Mesmo assim, dá pra fazer o app simular uma loja "viva":

1. **Aba A**: abrir `/admin/estoque` e clicar em **"Ver na loja"** no header — abre `/products` em **outra aba** mantendo a sessão (`<a target="_blank">`)
2. **Aba A**: criar um produto novo (use a galeria pra escolher uma imagem)
3. **Aba B (loja)**: o produto aparece **no grid em ~50ms**, sem refresh. Edit/delete também
4. Carrinho e favoritos funcionam do mesmo jeito entre abas

A combinação que torna isso possível: **Zustand `persist`** escreve em `localStorage` → **`useCrossTabSync`** ouve `storage event` e re-hidrata as outras abas → **`useHydrateProducts`** roda só uma vez por sessão pra não sobrescrever criados locais. Detalhes em cada hook/store linkado acima.

> **Limitações conscientes do mock**: produtos criados localmente sobrevivem a refresh mas **não a logout** (reset). Edições em produtos da API são preservadas até o admin clicar em **"Atualizar"** (refetch manual sobrescreve aqueles ids — produtos puramente locais com id alto não são afetados).

## Mapa de testes

Duas suítes complementares: **Vitest** (147 testes em jsdom + MSW, rápido e foca em lógica/integração) e **Playwright** (~30 specs E2E em browser real, foca em fluxos completos).

### Vitest (147)

| Arquivo | Testes | Cobre |
|---|---:|---|
| [src/lib/format.test.ts](src/lib/format.test.ts) | 24 | `formatBRL`, `formatPhoneBR`, `maskPhoneBR`, `formatCEP`, `maskCEP`, `maskBRL`, `parseBRL`, `isValidEmail` |
| [src/data/mocks.test.ts](src/data/mocks.test.ts) | 5 | Slugs Fakestore, `categoryLabels`, `getCategoryLabel`, `mockUsers` |
| [src/services/auth.service.test.ts](src/services/auth.service.test.ts) | ~5 | Login (200/401/network), token storage |
| [src/services/products.service.test.ts](src/services/products.service.test.ts) | ~6 | list/getById/create/update/remove + adapter Fakestore |
| [src/services/users.service.test.ts](src/services/users.service.test.ts) | ~7 | list/getById/create/update/remove + role resolver |
| [src/contexts/AuthContext.test.tsx](src/contexts/AuthContext.test.tsx) | ~4 | login OK, logout limpa stores, network error |
| [src/components/ErrorBoundary.test.tsx](src/components/ErrorBoundary.test.tsx) | ~3 | Captura erro filho, retry, fallback |
| [src/stores/cartStore.test.ts](src/stores/cartStore.test.ts) | 9 | add/increment/decrement/remove/setQuantity/subtotal/clear |
| [src/stores/favoritesStore.test.ts](src/stores/favoritesStore.test.ts) | 5 | toggle/isFavorite/remove/clear |
| [src/pages/LoginPage.test.tsx](src/pages/LoginPage.test.tsx) | ~7 | 401, network, redirect-back contra escalonamento, validação tab×role |
| [src/pages/admin/AdminProductsPage.test.tsx](src/pages/admin/AdminProductsPage.test.tsx) | 8 | CRUD via API + offline + refresh |
| [src/pages/admin/AdminUsersPage.test.tsx](src/pages/admin/AdminUsersPage.test.tsx) | 8 | CRUD via API + self-protection do admin |
| [src/pages/client/ProductsPage.test.tsx](src/pages/client/ProductsPage.test.tsx) | 3 | render, filtro por URL, adicionar ao carrinho |
| [src/pages/client/CheckoutPage.test.tsx](src/pages/client/CheckoutPage.test.tsx) | 4 | redirect cart vazio, validação e-mail/CEP, persistência sessionStorage |

`IntersectionObserver` é stubado em [src/test/setup.ts](src/test/setup.ts) — jsdom não implementa, e o `useInfiniteScroll` precisa.

### Playwright E2E (~30 specs em browser real)

| Arquivo | Cobre |
|---|---|
| [e2e/auth.spec.ts](e2e/auth.spec.ts) | Login admin/cliente, 401 inline, validação tab×role, redirect role-based, logout, persistência F5 |
| [e2e/client-shopping.spec.ts](e2e/client-shopping.spec.ts) | Catálogo → carrinho (add/qty/remove) → checkout (validação) → sucesso → F5 |
| [e2e/client-favorites.spec.ts](e2e/client-favorites.spec.ts) | Toggle no card, drawer, mover ao carrinho, toggle 2x remove |
| [e2e/admin-products.spec.ts](e2e/admin-products.spec.ts) | Criar com galeria, validação obrigatória, busca, "Ver na loja" cross-tab |
| [e2e/admin-users.spec.ts](e2e/admin-users.spec.ts) | Criar com validação completa, e-mail, busca, filtro por papel |
| [e2e/navigation.spec.ts](e2e/navigation.spec.ts) | 404 estilizada, URL filters, voltar do detalhe, header minimal, redirect-back seguro |

## 👨‍💻 Desenvolvedor

Projeto desenvolvido por **Alex Pablo de Oliveira Moraes** — estudante de **Sistemas de Informação** na **UNEMAT**.

- 💼 GitHub: [@AlexPablo-hub](https://github.com/AlexPablo-hub)
- 📫 Dúvidas, sugestões ou feedback sobre o projeto são muito bem-vindos!

> Se este projeto te ajudou de alguma forma, deixe uma ⭐ no repositório — isso me motiva a continuar evoluindo.
