import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertCircle, ChevronDown, Filter as FilterIcon, SearchX, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { ProductCard, ProductCardSkeleton } from '@/components/product/ProductCard'
import { useProductsStore } from '@/stores/productsStore'
import { useHydrateProducts } from '@/hooks/useHydrateProducts'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { categoryLabels, productCategories, type CategorySlug } from '@/data/mocks'
import { cn } from '@/lib/cn'
import { formatBRL } from '@/lib/format'
import {
  fadeIn,
  slideInLeft,
  slideUp,
  staggerContainerSlow,
  staggerItem,
} from '@/lib/motion'

type SortBy = 'relevance' | 'price-asc' | 'price-desc' | 'rating'
type RatingFilter = 'all' | '4' | '3' | '2' | '1'

const PAGE_SIZE = 8

/**
 * Badge derivado de dados reais da API. Antes eram hardcodes por id (ATELIER,
 * EXCLUSIVE, EDIÇÃO LIMITADA) que sobreviveram da era pré-Fakestore. Agora
 * o badge sai de métricas concretas: alta avaliação ou alta popularidade.
 */
function getProductBadge(p: { rating: { rate: number; count: number } }): string | undefined {
  if (p.rating.rate >= 4.7) return 'TOP RATED'
  if (p.rating.count >= 300) return 'BEST SELLER'
  return undefined
}

interface CategoryHeader {
  /** Slug PT-BR usado na URL (?categoria=...). */
  urlSlug: string
  /** Título visível e usado também no document.title. */
  title: string
  /** Subtítulo / descrição embaixo do h1. */
  description: string
}

const categoryHeaders: Record<CategorySlug, CategoryHeader> = {
  electronics: {
    urlSlug: 'eletronicos',
    title: 'Eletrônicos',
    description: 'Tecnologia de última geração para o dia a dia.',
  },
  jewelery: {
    urlSlug: 'joias',
    title: 'Joias',
    description: 'Peças atemporais em metais nobres e gemas selecionadas.',
  },
  "men's clothing": {
    urlSlug: 'masculino',
    title: 'Roupas masculinas',
    description: 'Vestuário com corte refinado e tecidos de alta qualidade.',
  },
  "women's clothing": {
    urlSlug: 'feminino',
    title: 'Roupas femininas',
    description: 'Coleção feminina com identidade contemporânea e elegante.',
  },
}

const defaultHeader = {
  title: 'Produtos',
  description: 'Catálogo completo NOIR LUXE — peças, eletrônicos e acessórios selecionados.',
}

/** Resolve um urlSlug PT-BR de volta para o slug Fakestore. */
function resolveCategoryFromUrl(urlSlug: string | null): CategorySlug | null {
  if (!urlSlug) return null
  const entry = (Object.entries(categoryHeaders) as Array<[CategorySlug, CategoryHeader]>).find(
    ([, h]) => h.urlSlug === urlSlug,
  )
  return entry ? entry[0] : null
}

/** Mapa SortBy ↔ slug PT-BR para a URL. 'relevance' é o default e fica fora da URL. */
const sortBySlug: Record<SortBy, string> = {
  relevance: '',
  'price-asc': 'menor-preco',
  'price-desc': 'maior-preco',
  rating: 'mais-avaliados',
}

function resolveSortFromUrl(slug: string | null): SortBy {
  if (!slug) return 'relevance'
  const entry = (Object.entries(sortBySlug) as Array<[SortBy, string]>).find(
    ([, s]) => s === slug,
  )
  return entry ? entry[0] : 'relevance'
}

export function ProductsPage() {
  const products = useProductsStore((s) => s.products)
  const { loading: hydrating, error: hydrateError, refresh } = useHydrateProducts()

  // Categoria + ordenação sincronizadas com a URL (?categoria=eletronicos&ordenar=menor-preco).
  // Bookmark, share e back/forward do browser passam a funcionar sem state extra.
  const [searchParams, setSearchParams] = useSearchParams()

  // Helper: atualiza UMA chave preservando as outras. Se valor é vazio/null,
  // remove a chave. Sem isso, mexer em "ordenar" zerava "categoria" (e vice-versa)
  // porque setSearchParams({k:v}) substitui o objeto inteiro.
  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  const selectedCategory = resolveCategoryFromUrl(searchParams.get('categoria'))
  const setSelectedCategory = (cat: CategorySlug | null) => {
    updateParam('categoria', cat ? categoryHeaders[cat].urlSlug : null)
  }

  const sortBy = resolveSortFromUrl(searchParams.get('ordenar'))
  const setSortBy = (s: SortBy) => {
    // 'relevance' é o default — fica fora da URL pra deixá-la limpa.
    updateParam('ordenar', s === 'relevance' ? null : sortBySlug[s])
  }

  // Header e título dinâmicos por categoria.
  const header = selectedCategory ? categoryHeaders[selectedCategory] : defaultHeader
  useDocumentTitle(selectedCategory ? `NOIR - ${header.title}` : 'NOIR LUXE')

  // Bounds derivados dos products reais (API + criados localmente).
  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 1000 }
    const prices = products.map((p) => p.price)
    const min = Math.floor(Math.min(...prices))
    const max = Math.ceil(Math.max(...prices))
    // Garante range mínimo pra não degenerar quando só há 1 produto.
    return { min, max: max === min ? min + 100 : max }
  }, [products])

  const [maxPrice, setMaxPrice] = useState<number>(priceBounds.max)
  // Quando o catálogo muda (hidratação ou criação local), expande o teto pra
  // não filtrar acidentalmente o produto recém-incluído.
  useEffect(() => {
    setMaxPrice(priceBounds.max)
  }, [priceBounds.max])

  const [minRating, setMinRating] = useState<RatingFilter>('all')
  const [sortOpen, setSortOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Quantos filtros estão ativos? Usado pra decorar o botão "Filtros" mobile
  // com um badge — assim o usuário sabe que há filtros aplicados mesmo com
  // a sidebar fechada.
  const activeFilterCount =
    (selectedCategory !== null ? 1 : 0) +
    (maxPrice < priceBounds.max ? 1 : 0) +
    (minRating !== 'all' ? 1 : 0)

  const filtered = useMemo(() => {
    let out = products
    if (selectedCategory) out = out.filter((p) => p.category === selectedCategory)
    if (maxPrice < priceBounds.max) out = out.filter((p) => p.price <= maxPrice)
    if (minRating !== 'all') {
      const floor = Number(minRating)
      out = out.filter((p) => p.rating.rate >= floor)
    }
    switch (sortBy) {
      case 'price-asc':
        out = [...out].sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        out = [...out].sort((a, b) => b.price - a.price)
        break
      case 'rating':
        out = [...out].sort((a, b) => b.rating.rate - a.rating.rate)
        break
    }
    return out
  }, [products, selectedCategory, maxPrice, priceBounds.max, minRating, sortBy])

  // Reseta a janela visível ao mudar qualquer filtro/ordenação.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [selectedCategory, maxPrice, minRating, sortBy])

  const visibleProducts = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const sentinelRef = useInfiniteScroll<HTMLDivElement>(
    () => setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length)),
    hasMore,
  )

  const showHardError = hydrateError && products.length === 0
  const loading = hydrating && products.length === 0

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of products) counts[p.category] = (counts[p.category] ?? 0) + 1
    return counts
  }, [products])

  const sortLabels: Record<SortBy, string> = {
    relevance: 'Recomendados',
    'price-asc': 'Menor preço',
    'price-desc': 'Maior preço',
    rating: 'Melhor avaliados',
  }

  if (showHardError) {
    return (
      <div className="mx-auto max-w-[1536px] px-8 py-20">
        <EmptyState
          icon={<AlertCircle className="h-6 w-6" />}
          title="Falha ao carregar produtos"
          description="Não foi possível conectar à API. Tente novamente."
          action={
            <Button onClick={refresh} variant="primary" loading={hydrating}>
              Tentar novamente
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-[1536px] px-8 py-20"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[256px_1fr]">
        {/* SIDEBAR — desktop fixo, mobile via drawer (Modal) */}
        <motion.aside
          variants={slideInLeft}
          initial="hidden"
          animate="visible"
          className="hidden pt-8 lg:block"
        >
          <FiltersPanel
            products={products}
            categoryCounts={categoryCounts}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            priceBounds={priceBounds}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            minRating={minRating}
            setMinRating={setMinRating}
          />
        </motion.aside>

        <Modal
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          title="Filtrar produtos"
          description="Refine sua busca por categoria, preço ou avaliação."
          footer={
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSelectedCategory(null)
                  setMaxPrice(priceBounds.max)
                  setMinRating('all')
                }}
              >
                Limpar
              </Button>
              <Button type="button" variant="primary" onClick={() => setFiltersOpen(false)}>
                Aplicar
              </Button>
            </>
          }
        >
          <FiltersPanel
            products={products}
            categoryCounts={categoryCounts}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            priceBounds={priceBounds}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            minRating={minRating}
            setMinRating={setMinRating}
          />
        </Modal>

        {/* MAIN GRID */}
        <section className="flex flex-col gap-8 pt-8">
          <motion.div
            variants={slideUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
          >
            <div className="flex flex-col gap-2">
              <motion.h1
                key={header.title}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="text-3xl font-semibold leading-9 tracking-[-0.3px] text-white"
              >
                {header.title}
              </motion.h1>
              <motion.p
                key={header.description}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="text-base leading-6 text-[#94a3b8]"
              >
                {header.description}
              </motion.p>
            </div>

            <div className="flex items-center gap-3">
              {/* Botão Filtros — só aparece em <lg, onde a sidebar fica oculta */}
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                aria-label="Abrir filtros"
                className="flex items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm font-medium tracking-[0.28px] text-[#94a3b8] hover:text-white lg:hidden"
              >
                <FilterIcon className="h-3.5 w-3.5" />
                Filtros
                {activeFilterCount > 0 && (
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#7c3aed] px-1.5 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSortOpen((o) => !o)}
                className="flex items-center gap-2 border border-white/10 px-4 py-2 text-sm font-medium tracking-[0.28px] text-[#94a3b8] hover:text-white"
                aria-haspopup="menu"
                aria-expanded={sortOpen}
              >
                <span>Ordenar: {sortLabels[sortBy]}</span>
                <ChevronDown className={cn('h-3 w-3 transition-transform', sortOpen && 'rotate-180')} />
              </button>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} aria-hidden />
                  <div className="absolute right-0 z-20 mt-1 w-56 rounded-md border border-white/10 bg-[rgba(15,23,42,0.95)] p-1 shadow-xl backdrop-blur-md animate-scale-in">
                    {(Object.keys(sortLabels) as SortBy[]).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setSortBy(opt)
                          setSortOpen(false)
                        }}
                        className={cn(
                          'block w-full rounded px-3 py-2 text-left text-sm transition-colors',
                          sortBy === opt
                            ? 'bg-white/5 text-[#a78bfa]'
                            : 'text-[#94a3b8] hover:bg-white/5 hover:text-white',
                        )}
                      >
                        {sortLabels[opt]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            </div>
          </motion.div>

          {/* Grid */}
          {loading ? (
            <motion.div
              variants={staggerContainerSlow}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div key={i} variants={staggerItem}>
                  <ProductCardSkeleton />
                </motion.div>
              ))}
            </motion.div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<SearchX className="h-6 w-6" />}
              title="Nenhuma peça encontrada"
              description="Ajuste os filtros para descobrir novas peças."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory(null)
                    setMaxPrice(priceBounds.max)
                    setMinRating('all')
                  }}
                >
                  Limpar filtros
                </Button>
              }
            />
          ) : (
            <>
              <motion.div
                variants={staggerContainerSlow}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {visibleProducts.map((p) => (
                  <motion.div key={p.id} variants={staggerItem}>
                    <ProductCard product={p} badge={getProductBadge(p)} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Sentinel + status — rolagem infinita */}
              <div className="flex flex-col items-center gap-3 pt-12">
                <p className="text-xs font-semibold uppercase tracking-[2.4px] text-[#475569]">
                  {hasMore
                    ? `Mostrando ${visibleProducts.length} de ${filtered.length} ${filtered.length === 1 ? 'peça' : 'peças'} — role para descobrir mais`
                    : `${filtered.length} ${filtered.length === 1 ? 'peça' : 'peças'} no total`}
                </p>
                {hasMore && (
                  <div ref={sentinelRef} aria-hidden className="h-px w-full" />
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </motion.div>
  )
}

interface CategoryItemProps {
  label: string
  count: number
  active: boolean
  onClick: () => void
}

function CategoryItem({ label, count, active, onClick }: CategoryItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-between text-base transition-colors',
        active ? 'text-[#a78bfa]' : 'text-[#94a3b8] hover:text-white',
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          'text-xs',
          active ? 'text-[#a78bfa]/60' : 'text-[#94a3b8]/60',
        )}
      >
        {count}
      </span>
    </button>
  )
}

interface FiltersPanelProps {
  products: Array<{ id: number }>
  categoryCounts: Record<string, number>
  selectedCategory: CategorySlug | null
  setSelectedCategory: (cat: CategorySlug | null) => void
  priceBounds: { min: number; max: number }
  maxPrice: number
  setMaxPrice: (n: number) => void
  minRating: RatingFilter
  setMinRating: (r: RatingFilter) => void
}

/**
 * Conjunto de filtros (categoria, preço, avaliação) reutilizado no aside
 * desktop (≥lg) e dentro do Modal mobile/tablet (<lg). Sem isso, mobile
 * ficaria sem como filtrar — a aside é `lg:block`.
 */
function FiltersPanel({
  products,
  categoryCounts,
  selectedCategory,
  setSelectedCategory,
  priceBounds,
  maxPrice,
  setMaxPrice,
  minRating,
  setMinRating,
}: FiltersPanelProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* CATEGORIAS */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-medium uppercase tracking-[1.4px] text-white">CATEGORIAS</h3>
        <div className="flex flex-col gap-2">
          <CategoryItem
            label="Todos os Itens"
            count={products.length}
            active={selectedCategory === null}
            onClick={() => setSelectedCategory(null)}
          />
          {productCategories.map((cat) => (
            <CategoryItem
              key={cat}
              label={categoryLabels[cat]}
              count={categoryCounts[cat] ?? 0}
              active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </div>
      </section>

      {/* FAIXA DE PREÇO */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-medium uppercase tracking-[1.4px] text-white">FAIXA DE PREÇO</h3>
        <div className="flex flex-col gap-4">
          <input
            type="range"
            min={priceBounds.min}
            max={priceBounds.max}
            step={1}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            aria-label="Preço máximo"
            aria-valuemin={priceBounds.min}
            aria-valuemax={priceBounds.max}
            aria-valuenow={maxPrice}
            className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-[#1e293b] accent-[#7c3aed]"
            style={{
              background: (() => {
                const span = priceBounds.max - priceBounds.min
                const pct = span > 0 ? ((maxPrice - priceBounds.min) / span) * 100 : 0
                return `linear-gradient(to right, #7c3aed 0%, #7c3aed ${pct}%, #1e293b ${pct}%, #1e293b 100%)`
              })(),
            }}
          />
          <div className="flex justify-between">
            <span className="text-xs font-semibold tracking-[0.6px] text-[#64748b]">
              {formatBRL(priceBounds.min)}
            </span>
            <span className="text-xs font-semibold tracking-[0.6px] text-[#64748b]">
              {formatBRL(maxPrice)}
            </span>
          </div>
        </div>
      </section>

      {/* AVALIAÇÃO */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-medium uppercase tracking-[1.4px] text-white">AVALIAÇÃO</h3>
        <div className="flex flex-col gap-2">
          {(['all', '4', '3', '2', '1'] as const).map((opt) => {
            const isActive = minRating === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setMinRating(opt)}
                aria-pressed={isActive}
                className={cn(
                  'flex items-center justify-between text-base transition-colors',
                  isActive ? 'text-[#a78bfa]' : 'text-[#94a3b8] hover:text-white',
                )}
              >
                {opt === 'all' ? (
                  <span>Todas</span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Star
                      className={cn(
                        'h-3.5 w-3.5 fill-[#facc15]',
                        isActive ? 'text-[#facc15]' : 'text-[#facc15]/80',
                      )}
                    />
                    {opt}
                    <span className="text-xs opacity-70">ou mais</span>
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
