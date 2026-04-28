import type { Product } from '@/types/product'
import type { User } from '@/types/user'

/**
 * Catálogo NOIR_LUXE — produtos curados conforme identidade do Figma.
 * Categorias usam slug PT-BR (não as da Fakestore API). A integração futura com a API
 * mapeia para os slugs originais (electronics/men's clothing/etc) numa camada de adaptação.
 */
export const mockProducts: Product[] = [
  {
    id: 1,
    title: 'Obsidian Wool Overcoat',
    price: 2450,
    description:
      'Sobretudo de lã virgem em tom obsidiana. Corte alfaiataria, forro acetinado, fechamento com botões de chifre.',
    category: 'casacos',
    image: '/images/coat.jpg',
    rating: { rate: 4.8, count: 92 },
    sku: 'NL-COA-1043',
    stock: 12,
  },
  {
    id: 2,
    title: 'Midnight Chronograph',
    price: 8900,
    description:
      'Cronógrafo automático em aço com calibre suíço. Mostrador noir, ponteiros luminescentes, vidro safira anti-reflexo.',
    category: 'relogios',
    image: '/images/watch-midnight.jpg',
    rating: { rate: 4.9, count: 174 },
    sku: 'NL-8829',
    stock: 7,
  },
  {
    id: 3,
    title: 'Raven Silk Pumps',
    price: 1290,
    description:
      'Scarpins em seda natural com bico fino. Salto 9cm forrado em couro italiano. Edição limitada.',
    category: 'calcados',
    image: '/images/shoe-pump.jpg',
    rating: { rate: 4.6, count: 88 },
    sku: 'NL-2210',
    stock: 4,
  },
  {
    id: 4,
    title: 'Essence No. 7',
    price: 450,
    description:
      'Fragrância oriental com notas de bergamota, oud e baunilha bourbon. 100ml em frasco esculpido. Produzida em Grasse, França.',
    category: 'fragrancias',
    image: '/images/fragrance.jpg',
    rating: { rate: 4.7, count: 213 },
    sku: 'NL-7702',
    stock: 28,
  },
  {
    id: 5,
    title: 'Obsidian X1 Chrono',
    price: 2490,
    description:
      'O ápice da precisão arquitetônica e materiais de alto desempenho. O Obsidian X1 apresenta couro de bezerro italiano tratado à mão, suporte integrado de fibra de carbono e uma entressola de dupla densidade para um luxo sem esforço a cada passo.',
    category: 'calcados',
    image: '/images/boot-obsidian.jpg',
    rating: { rate: 4.9, count: 156 },
    sku: 'NL-OBS-2024-X1',
    stock: 9,
  },
  {
    id: 6,
    title: 'Eclipse Chronograph',
    price: 4800,
    description:
      'Cronógrafo de edição limitada com case em carbono forjado. Pulseira em couro Barenia. 200 unidades numeradas mundialmente.',
    category: 'relogios',
    image: '/images/watch-eclipse.jpg',
    rating: { rate: 4.8, count: 67 },
    sku: 'NL-5512',
    stock: 3,
  },
  {
    id: 7,
    title: 'Heritage Satchel',
    price: 890,
    description:
      'Pasta executiva em couro italiano vegetal. Compartimento para notebook 15", divisórias internas em camurça.',
    category: 'boutique',
    image: '/images/satchel.jpg',
    rating: { rate: 4.5, count: 121 },
    sku: 'NL-1102',
    stock: 18,
  },
  {
    id: 8,
    title: 'Crimson Velocity',
    price: 450,
    description:
      'Tênis de performance em malha 3D com entressola em espuma de carbono. Cabedal sem costuras.',
    category: 'calcados',
    image: '/images/sneaker.jpg',
    rating: { rate: 4.4, count: 304 },
    sku: 'NL-4412',
    stock: 2,
  },
  {
    id: 9,
    title: 'Obsidian Belt',
    price: 590,
    description:
      'Cinto em couro full-grain envelhecido naturalmente. Fivela em aço escovado com gravação NOIR_LUXE.',
    category: 'boutique',
    image: '/images/belt.jpg',
    rating: { rate: 4.6, count: 45 },
    sku: 'NL-ACC-04',
    stock: 22,
  },
  {
    id: 10,
    title: 'Lunar Chrono',
    price: 1890,
    description:
      'Cronógrafo com mostrador efeito lunar e fases da lua mecânicas. Caixa em titânio escovado, pulseira em couro Barenia preto.',
    category: 'relogios',
    image: '/images/watch-lunar.jpg',
    rating: { rate: 4.7, count: 89 },
    sku: 'NL-WAT-22',
    stock: 6,
  },
  {
    id: 11,
    title: 'Vanguard Backpack',
    price: 1250,
    description:
      'Mochila executiva em couro italiano. Compartimento isolado para notebook, organização modular interna, alças anatômicas.',
    category: 'boutique',
    image: '/images/backpack.jpg',
    rating: { rate: 4.7, count: 132 },
    sku: 'NL-BAG-09',
    stock: 14,
  },
  {
    id: 12,
    title: 'Midnight Runner',
    price: 2490,
    description:
      'Tênis premium feito à mão com cabedal em couro italiano e entressola de carbono. Solado vibram especial.',
    category: 'calcados',
    image: '/images/sneaker.jpg',
    rating: { rate: 4.8, count: 178 },
    sku: 'NL-SHO-X2',
    stock: 10,
  },
]

/**
 * Categorias NOIR_LUXE — slugs PT-BR. Mantidas em uma única fonte da verdade
 * para facilitar a evolução (filtros, integração API, traduções).
 */
export const productCategories = [
  'casacos',
  'calcados',
  'relogios',
  'fragrancias',
  'boutique',
] as const

export type CategorySlug = (typeof productCategories)[number]

export const categoryLabels: Record<CategorySlug, string> = {
  casacos: 'Casacos',
  calcados: 'Calçados',
  relogios: 'Relógios',
  fragrancias: 'Fragrâncias',
  boutique: 'Boutique',
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
