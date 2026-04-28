import { http, HttpResponse } from 'msw'

const BASE = 'https://fakestoreapi.com'

/**
 * Conjunto de handlers MSW para a Fakestore API. Cobre os endpoints que a
 * aplicação usa: auth, products, users, carts.
 *
 * Cada teste pode adicionar/sobrescrever handlers via server.use() antes da
 * asserção, permitindo simular 401, 500, network errors etc.
 */

export const fakeUsers = [
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

export const fakeProducts = [
  {
    id: 1,
    title: 'Test Product',
    price: 29.9,
    description: 'A test product',
    category: "men's clothing",
    image: 'https://example.com/p.jpg',
    rating: { rate: 4.2, count: 50 },
  },
  {
    id: 2,
    title: 'Another Product',
    price: 99.0,
    description: 'Another one',
    category: 'electronics',
    image: 'https://example.com/p2.jpg',
    rating: { rate: 3.8, count: 12 },
  },
]

export const handlers = [
  // POST /auth/login — retorna token se credenciais válidas
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { username: string; password: string }
    const user = fakeUsers.find(
      (u) => u.username === body.username && u.password === body.password,
    )
    if (!user) {
      return HttpResponse.json({ error: 'username or password is incorrect' }, { status: 401 })
    }
    return HttpResponse.json({ token: `mock-token-for-${user.username}` })
  }),

  // GET /users — lista todos os usuários
  http.get(`${BASE}/users`, () => HttpResponse.json(fakeUsers)),

  // GET /users/:id
  http.get(`${BASE}/users/:id`, ({ params }) => {
    const id = Number(params.id)
    const user = fakeUsers.find((u) => u.id === id)
    return user ? HttpResponse.json(user) : new HttpResponse(null, { status: 404 })
  }),

  // POST /users — cria usuário (Fakestore retorna echo)
  http.post(`${BASE}/users`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({ id: 99, ...body })
  }),

  // PUT /users/:id
  http.put(`${BASE}/users/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({ id: Number(params.id), ...body })
  }),

  // DELETE /users/:id
  http.delete(`${BASE}/users/:id`, ({ params }) => {
    const id = Number(params.id)
    const user = fakeUsers.find((u) => u.id === id)
    return user ? HttpResponse.json(user) : new HttpResponse(null, { status: 404 })
  }),

  // GET /products
  http.get(`${BASE}/products`, () => HttpResponse.json(fakeProducts)),

  // GET /products/:id
  http.get(`${BASE}/products/:id`, ({ params }) => {
    const id = Number(params.id)
    const product = fakeProducts.find((p) => p.id === id)
    return product ? HttpResponse.json(product) : new HttpResponse(null, { status: 404 })
  }),

  // POST /products
  http.post(`${BASE}/products`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({ id: 999, ...body })
  }),

  // PUT /products/:id
  http.put(`${BASE}/products/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({ id: Number(params.id), ...body })
  }),

  // DELETE /products/:id
  http.delete(`${BASE}/products/:id`, ({ params }) => {
    const id = Number(params.id)
    const product = fakeProducts.find((p) => p.id === id)
    return product ? HttpResponse.json(product) : new HttpResponse(null, { status: 404 })
  }),

  // GET /products/categories
  http.get(`${BASE}/products/categories`, () =>
    HttpResponse.json(['electronics', 'jewelery', "men's clothing", "women's clothing"]),
  ),
]
