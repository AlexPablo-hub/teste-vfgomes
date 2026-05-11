# NOIR LUXE — Escopo do Projeto

Mini e-commerce em React + TypeScript construído sobre a [Fakestore API](https://fakestoreapi.com/docs).
Stack: **React 18 + Vite + TypeScript + Tailwind 4**.

## Objetivo

Consumir a Fakestore API para entregar um mini e-commerce funcional com dois perfis de usuário
e persistência local que contorna o fato da API ser read-only.

## Funcionalidades

### Base

- Autenticação e autorização
- Separação de tipos de usuário (admin / cliente)

### Perfil admin

- Login
- CRUD de usuários (listagem, criação, edição, exclusão)
- CRUD de produtos (listagem, criação, edição, exclusão)

### Perfil cliente

- Login
- Listagem dos produtos
- Adicionar produtos ao carrinho, alterar quantidade, remover itens
- Visualizar subtotal/total e finalizar compra (mock)

## Sobre a Fakestore (read-only)

A Fakestore API não salva nada — é read-only. As operações `POST`/`PUT`/`DELETE` retornam echo
mas não persistem. Por isso, este projeto faz mock local com `localStorage` (via Zustand persist)
para simular um e-commerce "vivo".

A Fakestore também não tem campo `role` em `GET /users`. Para simular os dois tipos de usuário,
o projeto resolve a role por `username`:

```
CONTA ADMIN
  username: "mor_2314"
  password: "83r5^_"

CONTA CLIENTE
  username: "kevinryan"
  password: "kev02937@"
```

## Características técnicas entregues

- **Design moderno com animações** — layout responsivo (mobile, tablet, desktop), estados visuais de
  loading/erro/vazio, feedback em interações (hover, transições suaves), acessibilidade básica
  (labels, alt em imagens, foco visível)
- **Consumo de API com tipagem TypeScript strict**
- **Estruturação por responsabilidade** — components, pages, services, hooks, stores, lib
- **Context API** para a sessão do usuário (`AuthContext`)
- **Zustand 5 com persist** para estado global (carrinho, produtos, usuários, favoritos, toasts)
- **Tratamento avançado de erros** — classes tipadas (`AppError` → `ApiError`/`AuthError`/`NetworkError`/`ValidationError`),
  interceptor do axios e `ErrorBoundary` global
- **Vitest + Testing Library + MSW** — 147 testes unit/integration
- **Playwright** — ~30 specs E2E em browser real
- **Prototipação em Figma** — protótipo publicado na Figma Community
- **Commits Git incrementais** com histórico granular
