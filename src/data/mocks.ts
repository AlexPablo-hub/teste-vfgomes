import type { User } from '@/types/user'

/**
 * Os produtos vêm exclusivamente da Fakestore API agora — não há mais seed
 * local. As categorias e labels PT-BR seguem aqui porque são metadados
 * estáveis usados pela UI (filtros, header dinâmico, badges).
 */

/**
 * Slugs de categoria — exatamente os 4 que a Fakestore API retorna.
 * Mantemos como `as const` para tipagem strict no resto da aplicação.
 */
export const productCategories = [
  'electronics',
  'jewelery',
  "men's clothing",
  "women's clothing",
] as const

export type CategorySlug = (typeof productCategories)[number]

/** Map slug Fakestore → label PT-BR semanticamente correto. */
export const categoryLabels: Record<CategorySlug, string> = {
  electronics: 'Eletrônicos',
  jewelery: 'Joias',
  "men's clothing": 'Roupas masculinas',
  "women's clothing": 'Roupas femininas',
}

/** Retorna o label PT-BR para um slug, ou o próprio slug se não for um dos 4. */
export function getCategoryLabel(slug: string): string {
  return (categoryLabels as Record<string, string>)[slug] ?? slug
}

export const mockUsers: User[] = [
  {
    id: 1,
    email: 'john@gmail.com',
    username: 'johnd',
    password: 'm38rmF$',
    name: { firstname: 'John', lastname: 'Doe' },
    address: {
      city: 'Kilcoole',
      street: 'New Road',
      number: 7682,
      zipcode: '12926-3874',
      geolocation: { lat: '-37.3159', long: '81.1496' },
    },
    phone: '1-570-236-7033',
    role: 'client',
  },
  {
    id: 2,
    email: 'morrison@gmail.com',
    username: 'mor_2314',
    password: '83r5^_',
    name: { firstname: 'Alexander', lastname: 'Black' },
    address: {
      city: 'Kilcoole',
      street: 'Lovers Ln',
      number: 7267,
      zipcode: '12926-3874',
      geolocation: { lat: '-37.3159', long: '81.1496' },
    },
    phone: '1-570-236-7033',
    role: 'admin',
  },
  {
    id: 3,
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
    role: 'client',
  },
  {
    id: 4,
    email: 'don@gmail.com',
    username: 'donero',
    password: 'ewedon',
    name: { firstname: 'Don', lastname: 'Romer' },
    address: {
      city: 'San Antonio',
      street: 'Hunters Creek Dr',
      number: 6454,
      zipcode: '98234-1734',
      geolocation: { lat: '50.3467', long: '-20.1310' },
    },
    phone: '1-765-789-6734',
    role: 'client',
  },
  {
    id: 5,
    email: 'derek@gmail.com',
    username: 'derek',
    password: 'jklg*_56',
    name: { firstname: 'Derek', lastname: 'Powell' },
    address: {
      city: 'San Antonio',
      street: 'Adams St',
      number: 245,
      zipcode: '80796-1234',
      geolocation: { lat: '40.3467', long: '-40.1310' },
    },
    phone: '1-956-001-1945',
    role: 'client',
  },
  {
    id: 6,
    email: 'david@gmail.com',
    username: 'david_r',
    password: '3478*#54',
    name: { firstname: 'David', lastname: 'Russel' },
    address: {
      city: 'El Paso',
      street: 'Stoneridge St',
      number: 1342,
      zipcode: '50796-1234',
      geolocation: { lat: '20.1677', long: '-10.6789' },
    },
    phone: '1-678-345-2345',
    role: 'admin',
  },
]
