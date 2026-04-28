import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, ChevronDown, SearchX } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProductCard, ProductCardSkeleton } from '@/components/product/ProductCard'
import { useProductsStore } from '@/stores/productsStore'
import { categoryLabels, productCategories } from '@/data/mocks'
import { cn } from '@/lib/cn'
import {
  fadeIn,
  slideInLeft,
  slideUp,
  staggerContainerSlow,
  staggerItem,
} from '@/lib/motion'

type SortBy = 'relevance' | 'price-asc' | 'price-desc' | 'rating'

const palette = [
  { id: 'noir', label: 'Noir', color: '#020617', ring: true },
  { id: 'mocha', label: 'Mocha', color: '#1c1917' },
  { id: 'silver', label: 'Silver', color: '#9ca3af' },
  { id: 'indigo', label: 'Indigo', color: '#1e1b4b' },
] as const

const productBadges: Record<number, string> = {
  1: 'ATELIER',
  2: 'EXCLUSIVE',
  5: 'EDIÇÃO LIMITADA',
  6: 'EXCLUSIVE',
}

export function ProductsPage() {
  const products = useProductsStore((s) => s.products)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [maxPrice, setMaxPrice] = useState<number>(10000)
  const [selectedPalette, setSelectedPalette] = useState<string>('noir')
  const [sortBy, setSortBy] = useState<SortBy>('relevance')
  const [sortOpen, setSortOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    const t = window.setTimeout(() => setLoading(false), 1200)
    return () => window.clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    let out = products
    if (selectedCategory) out = out.filter((p) => p.category === selectedCategory)
    if (maxPrice < 10000) out = out.filter((p) => p.price <= maxPrice)
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
  }, [products, selectedCategory, maxPrice, sortBy])

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

  if (error) {
    return (
      <div className="mx-auto max-w-[1536px] px-8 py-20">
        <EmptyState
          icon={<AlertCircle className="h-6 w-6" />}
          title="Falha ao carregar produtos"
          description={error}
          action={
            <Button onClick={() => setError(null)} variant="primary">
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
        {/* SIDEBAR */}
        <motion.aside
          variants={slideInLeft}
          initial="hidden"
          animate="visible"
          className="hidden pt-8 lg:block"
        >
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
                  min={500}
                  max={10000}
                  step={100}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  aria-label="Preço máximo"
                  className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-[#1e293b] accent-[#7c3aed]"
                  style={{
                    background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${((maxPrice - 500) / 9500) * 100}%, #1e293b ${((maxPrice - 500) / 9500) * 100}%, #1e293b 100%)`,
                  }}
                />
                <div className="flex justify-between">
                  <span className="text-xs font-semibold tracking-[0.6px] text-[#64748b]">$500</span>
                  <span className="text-xs font-semibold tracking-[0.6px] text-[#64748b]">
                    {maxPrice >= 10000 ? '$10,000+' : `$${maxPrice.toLocaleString('en-US')}`}
                  </span>
                </div>
              </div>
            </section>

            {/* PALETA */}
            <section className="flex flex-col gap-4">
              <h3 className="text-sm font-medium uppercase tracking-[1.4px] text-white">PALETA</h3>
              <div className="flex items-center gap-2">
                {palette.map((p) => {
                  const isActive = selectedPalette === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPalette(p.id)}
                      aria-label={p.label}
                      aria-pressed={isActive}
                      title={p.label}
                      className={cn(
                        'h-6 w-6 rounded-full border transition-all',
                        isActive
                          ? 'border-white/20'
                          : 'border-white/10 hover:border-white/30',
                      )}
                      style={{
                        backgroundColor: p.color,
                        boxShadow: isActive ? '0px 0px 0px 2px #020617, 0px 0px 0px 3px #7c3aed' : undefined,
                      }}
                    />
                  )
                })}
              </div>
            </section>
          </div>
        </motion.aside>

        {/* MAIN GRID */}
        <section className="flex flex-col gap-8 pt-8">
          <motion.div
            variants={slideUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
          >
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold leading-9 tracking-[-0.3px] text-white">Novidades</h1>
              <p className="text-base leading-6 text-[#94a3b8]">
                Excelência curada do nosso ateliê de outono.
              </p>
            </div>

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
                    setMaxPrice(10000)
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
                {filtered.map((p) => (
                  <motion.div key={p.id} variants={staggerItem}>
                    <ProductCard product={p} badge={productBadges[p.id]} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Load More */}
              <div className="flex flex-col items-center gap-6 pt-12">
                <p className="text-xs font-semibold uppercase tracking-[2.4px] text-[#475569]">
                  Mostrando {filtered.length} de 124 obras-primas
                </p>
                <button
                  type="button"
                  className="border border-white/10 px-12 py-4 text-base text-white transition-colors hover:border-white/30 hover:bg-white/5"
                >
                  Descobrir Mais
                </button>
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
