
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
username: "mor_2314"
password: "83r5^_"

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
    - Tema claro/escuro
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