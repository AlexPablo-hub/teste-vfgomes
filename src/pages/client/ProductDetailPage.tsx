import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, Heart, ShoppingCart, Check, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { useProductsStore } from '@/stores/productsStore'
import { useCartStore } from '@/stores/cartStore'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useHydrateProducts } from '@/hooks/useHydrateProducts'
import { categoryLabels, type CategorySlug } from '@/data/mocks'
import { formatBRL } from '@/lib/format'
import { formatSku } from '@/types/product'
import { cn } from '@/lib/cn'
import {
  inViewport,
  revealUp,
  staggerContainer,
  staggerItem,
  zoomIn,
} from '@/lib/motion'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const products = useProductsStore((s) => s.products)
  // Hidratação ainda em voo? Mostramos skeleton em vez de redirecionar
  // pra /products quando o store está vazio na primeira carga.
  const { loading: hydrating } = useHydrateProducts()
  const add = useCartStore((s) => s.add)
  const isFavorite = useFavoritesStore((s) =>
    id ? s.isFavorite(Number(id)) : false,
  )
  const toggleFavorite = useFavoritesStore((s) => s.toggle)
  const [added, setAdded] = useState(false)

  const product = useMemo(() => products.find((p) => p.id === Number(id)), [products, id])
  const related = useMemo(
    () => products.filter((p) => p.id !== Number(id)).slice(0, 4),
    [products, id],
  )

  // Quando o usuário clica num card relacionado, o React Router só troca o
  // `id` e re-renderiza este mesmo componente — não scrolla pro topo nem
  // re-dispara as entradas de viewport. Isso causa: posição preservada num
  // ponto da página antiga e cards relacionados parecendo "sumir" porque os
  // motion.div novos herdam estado visível do parent já-renderizado.
  // Subir a tela e usar `key={id}` no grid (abaixo) restaura a UX de "abrir
  // um produto novo".
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  // Skeleton enquanto hidrata pela primeira vez. Sem isso, acessar a URL
  // direta com store vazio caía direto no <Navigate to="/products"> e o
  // usuário nem chegava a ver a página.
  if (!product && hydrating) return <ProductDetailSkeleton />
  if (!product) return <Navigate to="/products" replace />

  const handleAdd = () => {
    add(product, 1)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

  // Specs derivadas dos dados que a Fakestore realmente fornece — cada linha
  // é uma propriedade da API + o SKU calculado.
  const categoryLabel =
    (categoryLabels as Record<string, string>)[product.category as CategorySlug] ?? product.category
  const techSpecs: Array<[string, string]> = [
    ['Categoria', categoryLabel],
    [
      'Avaliação',
      `${product.rating.rate.toFixed(1)} / 5  ·  ${product.rating.count} avaliações`,
    ],
    [
      'Estoque',
      product.stock === undefined
        ? 'Sob consulta'
        : product.stock > 0
        ? `${product.stock} unidades disponíveis`
        : 'Esgotado',
    ],
    ['SKU', formatSku(product)],
    ['Preço', formatBRL(product.price)],
    ['Descrição', product.description],
  ]

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-24 px-8 pb-24 pt-32">
      {/* Botão voltar — alinhado à direita, acima da imagem */}
      <div className="flex justify-end -mb-16">
        <Link
          to="/products"
          aria-label="Voltar para a loja"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-[rgba(15,23,42,0.6)] px-4 text-sm font-medium tracking-[0.28px] text-[#94a3b8] backdrop-blur-[6px] transition-all hover:border-white/30 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </div>

      {/* Hero Section */}
      <section className="grid grid-cols-1 gap-12 lg:grid-cols-[700px_1fr]">
        {/* Imagem principal */}
        <motion.div
          variants={zoomIn}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-4"
        >
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white">
            <div className="aspect-[700/874] w-full">
              <img
                src={product.image}
                alt={product.title}
                className="h-full w-full object-contain p-12"
              />
            </div>
          </div>
        </motion.div>

        {/* Detalhes — stagger via Framer Motion */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col"
        >
          <motion.div variants={staggerItem} className="flex flex-col gap-3">
            <span className="text-base uppercase tracking-[1.6px] text-[#a78bfa]">{categoryLabel}</span>
            <h1 className="text-4xl font-normal leading-[48px] text-[#dce1fb]">
              {product.title}
            </h1>
            <div className="flex items-center gap-3 pt-1 text-sm text-[#94a3b8]">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-[#facc15] text-[#facc15]" />
                <span className="font-semibold text-white">{product.rating.rate.toFixed(1)}</span>
                <span>({product.rating.count})</span>
              </span>
              <span aria-hidden>·</span>
              <span>{formatSku(product)}</span>
            </div>
            <div className="flex items-center gap-4 pt-3">
              <span className="text-2xl font-normal leading-8 text-white">
                {formatBRL(product.price)}
              </span>
              {(product.stock ?? 0) > 0 && (
                <span className="rounded-full bg-[rgba(124,58,237,0.3)] px-3 py-1 text-base text-[#a78bfa]">
                  Em Estoque
                </span>
              )}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div variants={staggerItem} className="mt-10 flex flex-col gap-4">
            <button
              type="button"
              onClick={handleAdd}
              className={cn(
                'flex h-16 w-full items-center justify-center gap-3 rounded-lg text-base text-white transition-all active:scale-[0.99]',
                added ? 'bg-emerald-600' : 'bg-[#7c3aed] hover:bg-[#6d28d9]',
              )}
              style={{
                boxShadow: '0px 10px 15px -3px rgba(124,58,237,0.2), 0px 4px 6px -4px rgba(124,58,237,0.2)',
              }}
            >
              {added ? (
                <>
                  <Check className="h-5 w-5" /> Adicionado ao carrinho
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" /> Adicionar ao Carrinho
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => toggleFavorite(product)}
              aria-pressed={isFavorite}
              className="flex items-center justify-center gap-2 text-sm text-[#94a3b8] transition-colors hover:text-white"
            >
              <Heart
                className={cn('h-4 w-4', isFavorite && 'fill-[#a78bfa] text-[#a78bfa]')}
              />
              {isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Especificações Técnicas — gerada a partir dos campos da API */}
      <motion.section
        variants={revealUp}
        initial="hidden"
        whileInView="visible"
        viewport={inViewport}
        className="flex flex-col gap-8"
      >
        <h2 className="text-base text-white">Especificações Técnicas</h2>
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[rgba(25,31,49,0.8)] backdrop-blur-[10px]">
          <table className="w-full text-left">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                <th scope="col" className="w-1/3 p-6 text-base uppercase tracking-[0.8px] text-[#94a3b8]">
                  ATRIBUTO
                </th>
                <th scope="col" className="p-6 text-base uppercase tracking-[0.8px] text-[#94a3b8]">
                  DETALHES
                </th>
              </tr>
            </thead>
            <tbody>
              {techSpecs.map(([k, v], i) => (
                <tr key={k} className={cn(i < techSpecs.length - 1 && 'border-b border-white/5')}>
                  <td className="p-6 align-top text-base text-white">{k}</td>
                  <td className="p-6 text-base text-[#94a3b8]">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Complete o Look */}
      <motion.section
        variants={revealUp}
        initial="hidden"
        whileInView="visible"
        viewport={inViewport}
        className="flex flex-col gap-8"
      >
        <div className="flex items-end justify-between">
          <h2 className="text-base text-white">Complete a compra</h2>
          <Link to="/products" className="text-base text-[#a78bfa] hover:underline">
            Ver Loja
          </Link>
        </div>
        <motion.div
          // `key={id}` força remontagem do grid sempre que o produto atual
          // muda — assim o stagger volta a animar do zero pros 4 novos cards.
          key={id}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-6 lg:grid-cols-4"
        >
          {related.map((p) => (
            <motion.div key={p.id} variants={staggerItem}>
              <RelatedCard product={p} />
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </div>
  )
}

function RelatedCard({
  product,
}: {
  product: import('@/types/product').Product
}) {
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id))
  const toggleFavorite = useFavoritesStore((s) => s.toggle)
  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col rounded-xl border border-white/10 bg-[rgba(25,31,49,0.8)] p-[17px] backdrop-blur-[10px] transition-all hover:-translate-y-0.5 hover:border-white/20"
    >
      <div className="mb-4 overflow-hidden rounded-lg">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="h-[252px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      {/* min-h reserva o espaço de 2 linhas (text-base × leading default = 24px × 2 = 48px)
          pra cards com título curto não ficarem mais baixos no grid. */}
      <h3 className="line-clamp-2 min-h-[48px] text-base text-white">{product.title}</h3>
      <p className="pb-3 text-base text-[#64748b]">{formatSku(product)}</p>
      <div className="mt-auto flex items-center justify-between">
        <span className="text-base text-[#a78bfa]">{formatBRL(product.price)}</span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleFavorite(product)
          }}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          aria-pressed={isFavorite}
          className="text-white hover:text-[#a78bfa]"
        >
          <Heart className={cn('h-[18px] w-5', isFavorite && 'fill-[#a78bfa] text-[#a78bfa]')} />
        </button>
      </div>
    </Link>
  )
}

function ProductDetailSkeleton() {
  return (
    <div
      aria-busy
      aria-label="Carregando produto"
      className="mx-auto flex max-w-[1280px] flex-col gap-24 px-8 pb-24 pt-32"
    >
      <section className="grid grid-cols-1 gap-12 lg:grid-cols-[700px_1fr]">
        {/* Imagem */}
        <div className="aspect-[700/874] w-full animate-pulse rounded-xl border border-white/10 bg-[rgba(25,31,49,0.5)]" />
        {/* Detalhes */}
        <div className="flex flex-col gap-4">
          <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
          <div className="h-12 w-full animate-pulse rounded bg-white/10" />
          <div className="h-12 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="mt-4 h-8 w-40 animate-pulse rounded bg-white/10" />
          <div className="mt-8 h-16 w-full animate-pulse rounded-lg bg-white/10" />
          <div className="h-4 w-48 animate-pulse rounded bg-white/5" />
        </div>
      </section>
      <section className="flex flex-col gap-6">
        <div className="h-5 w-56 animate-pulse rounded bg-white/10" />
        <div className="h-72 w-full animate-pulse rounded-xl border border-white/10 bg-[rgba(25,31,49,0.5)]" />
      </section>
    </div>
  )
}
