/**
 * Tipos das respostas da Fakestore API. Mantemos separados dos types da
 * aplicação (src/types/) para deixar explícito o contrato com a API
 * — assim, mudanças no shape da API ficam isoladas aqui e o resto da app
 * usa os types domésticos via funções de mapeamento (adapters).
 */

export interface FakestoreLoginResponse {
  token: string
}

export interface FakestoreUserName {
  firstname: string
  lastname: string
}

export interface FakestoreUserAddress {
  city: string
  street: string
  number: number
  zipcode: string
  geolocation: { lat: string; long: string }
}

export interface FakestoreUser {
  id: number
  email: string
  username: string
  password: string
  name: FakestoreUserName
  address: FakestoreUserAddress
  phone: string
}

export interface FakestoreRating {
  rate: number
  count: number
}

export interface FakestoreProduct {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
  rating: FakestoreRating
}

export interface FakestoreCartProduct {
  productId: number
  quantity: number
}

export interface FakestoreCart {
  id: number
  userId: number
  date: string
  products: FakestoreCartProduct[]
}
