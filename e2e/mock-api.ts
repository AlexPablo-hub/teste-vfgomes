import type { Page } from '@playwright/test'

/**
 * Mocka todas as chamadas à Fakestore API pra que os testes E2E não dependam
 * de network externa. Sem isso, os runners do GitHub Actions podem ter
 * problema de rede com fakestoreapi.com (rate limit, IP bloqueado, downtime)
 * e os testes ficam flaky.
 *
 * As respostas seguem o formato real da Fakestore (atestado pelo MSW dos
 * testes Vitest) — incluindo as 2 contas obrigatórias do enunciado.
 *
 * Uso:
 *   test.beforeEach(async ({ page }) => {
 *     await mockFakestore(page)
 *     await clearStorage(page)
 *   })
 */

const BASE = 'https://fakestoreapi.com'

const fakeUsers = [
  {
    id: 1,
    email: 'morrison@gmail.com',
    username: 'mor_2314',
    password: '83r5^_',
    name: { firstname: 'David', lastname: 'Morrison' },
    address: {
      city: 'Kilcoole',
      street: 'Lovers Ln',
      number: 7267,
      zipcode: '12926-3874',
      geolocation: { lat: '-37.3159', long: '81.1496' },
    },
    phone: '1-570-236-7033',
  },
  {
    id: 2,
    email: 'kevin@gmail.com',
    username: 'kevinryan',
    password: 'kev02937@',
    name: { firstname: 'Kevin', lastname: 'Ryan' },
    address: {
      city: 'Cullman',
      street: 'Frances Ct',
      number: 86,
      zipcode: '29567-1452',
      geolocation: { lat: '40.3467', long: '-30.1310' },
    },
    phone: '1-567-094-1345',
  },
]

const fakeProducts = [
  {
    id: 1,
    title: 'Smartphone Galaxy Pro',
    price: 1299,
    description: 'Smartphone com câmera tripla',
    category: 'electronics',
    image: 'https://fakestoreapi.com/img/p1.jpg',
    rating: { rate: 4.5, count: 120 },
  },
  {
    id: 2,
    title: 'Anel Solitário Ouro 18k',
    price: 2499,
    description: 'Anel em ouro 18k com diamante',
    category: 'jewelery',
    image: 'https://fakestoreapi.com/img/p2.jpg',
    rating: { rate: 4.8, count: 87 },
  },
  {
    id: 3,
    title: 'Camisa Social Slim',
    price: 199,
    description: 'Camisa em algodão egípcio',
    category: "men's clothing",
    image: 'https://fakestoreapi.com/img/p3.jpg',
    rating: { rate: 4.2, count: 56 },
  },
  {
    id: 4,
    title: 'Vestido Floral Verão',
    price: 299,
    description: 'Vestido fluido com estampa exclusiva',
    category: "women's clothing",
    image: 'https://fakestoreapi.com/img/p4.jpg',
    rating: { rate: 4.6, count: 312 },
  },
  {
    id: 5,
    title: 'Notebook Pro 16"',
    price: 8999,
    description: 'Notebook com processador M3',
    category: 'electronics',
    image: 'https://fakestoreapi.com/img/p5.jpg',
    rating: { rate: 4.9, count: 200 },
  },
]

export async function mockFakestore(page: Page) {
  // POST /auth/login — valida credenciais contra fakeUsers
  await page.route(`${BASE}/auth/login`, async (route) => {
    const body = (await route.request().postDataJSON()) as {
      username?: string
      password?: string
    }
    const user = fakeUsers.find(
      (u) => u.username === body.username && u.password === body.password,
    )
    if (!user) {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'username or password is incorrect' }),
      })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: `mock-token-${user.username}` }),
    })
  })

  // GET /users e /users/:id
  await page.route(/fakestoreapi\.com\/users(\/\d+)?$/, async (route) => {
    const url = route.request().url()
    const idMatch = url.match(/\/users\/(\d+)$/)
    if (idMatch) {
      const id = Number(idMatch[1])
      const user = fakeUsers.find((u) => u.id === id)
      if (!user) {
        await route.fulfill({ status: 404, body: '' })
        return
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(user),
      })
      return
    }
    // GET /users (lista)
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fakeUsers),
      })
      return
    }
    // POST /users (cria) — Fakestore retorna echo com id fake
    if (route.request().method() === 'POST') {
      const body = await route.request().postDataJSON()
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 999, ...body }),
      })
      return
    }
    await route.continue()
  })

  // PUT/DELETE /users/:id
  await page.route(/fakestoreapi\.com\/users\/\d+$/, async (route) => {
    const method = route.request().method()
    if (method === 'PUT') {
      const body = await route.request().postDataJSON()
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      })
      return
    }
    if (method === 'DELETE') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1 }),
      })
      return
    }
    await route.continue()
  })

  // GET /products e /products/:id, POST /products
  await page.route(/fakestoreapi\.com\/products(\/\d+)?$/, async (route) => {
    const url = route.request().url()
    const method = route.request().method()
    const idMatch = url.match(/\/products\/(\d+)$/)

    if (idMatch && method === 'GET') {
      const id = Number(idMatch[1])
      const product = fakeProducts.find((p) => p.id === id)
      if (!product) {
        await route.fulfill({ status: 404, body: '' })
        return
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(product),
      })
      return
    }

    if (idMatch && method === 'PUT') {
      const body = await route.request().postDataJSON()
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      })
      return
    }

    if (idMatch && method === 'DELETE') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: Number(idMatch[1]) }),
      })
      return
    }

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fakeProducts),
      })
      return
    }

    if (method === 'POST') {
      const body = await route.request().postDataJSON()
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 999, ...body, rating: { rate: 0, count: 0 } }),
      })
      return
    }

    await route.continue()
  })
}
