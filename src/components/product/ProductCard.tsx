import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import type { Product } from '@/types/product'
import { useCartStore } from '@/stores/cartStore'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { categoryLabels, type CategorySlug } from '@/data/mocks'
import { formatBRL } from '@/lib/format'
import { cn } from '@/lib/cn'

interface ProductCardProps {
  product: Product
  /** Badge sobreposto na imagem (ex: "ATELIER", "EXCLUSIVE", "EDIÇÃO LIMITADA"). */
  badge?: string
}

export function ProductCard({ product, badge }: ProductCardProps) {
  const add = useCartStore((s) => s.add)
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id))
  const toggleFavorite = useFavoritesStore((s) => s.toggle)
  const [pulse, setPulse] = useState(false)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    add(product, 1)
    setPulse(true)
    window.setTimeout(() => setPulse(false), 280)
  }

  const categoryLabel =
    (categoryLabels as Record<string, string>)[product.category as CategorySlug] ?? product.category

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[rgba(15,23,42,0.8)] backdrop-blur-[10px] transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/40">
      <Link
        to={`/products/${product.id}`}
        className="relative block h-[285px] w-full overflow-hidden"
        aria-label={`Ver detalhes de ${product.title}`}
      >
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {badge && (
          <span className="absolute left-4 top-2 rounded-full border border-[#8b5cf6]/30 bg-[rgba(76,29,149,0.3)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.6px] text-[#a78bfa] backdrop-blur-[6px]">
            {badge}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleFavorite(product)
          }}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          aria-pressed={isFavorite}
          className="absolute right-4 top-4 grid h-5 w-5 place-items-center text-white transition-colors hover:text-[#a78bfa]"
        >
          <Heart
            className={cn('h-[18px] w-[18px] transition-all', isFavorite ? 'fill-[#a78bfa] text-[#a78bfa]' : '')}
          />
        </button>
      </Link>

      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-1">
          <Link to={`/products/${product.id}`}>
            {/* min-h reserva o espaço de 2 linhas (leading 19.6px × 2 = ~40px)
                pra cards com título curto não ficarem mais baixos que os
                de título longo, mantendo o grid alinhado. */}
            <h3 className="line-clamp-2 min-h-[40px] text-sm font-medium leading-[19.6px] tracking-[0.28px] text-white transition-colors hover:text-[#a78bfa]">
              {product.title}
            </h3>
          </Link>
          <p className="text-base uppercase leading-6 tracking-[1.6px] text-[#64748b]">
            {categoryLabel}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-normal leading-[28.8px] text-white">
            {formatBRL(product.price)}
          </span>
          <div className="flex items-center gap-1">
            <span aria-hidden className="h-3 w-3 rounded-full border border-white/20 bg-[#020617]" />
            <span aria-hidden className="h-3 w-3 rounded-full border border-white/10 bg-[#1e1b4b]" />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          aria-label={`Adicionar ${product.title} ao carrinho`}
          className={cn(
            'inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#7c3aed] text-base font-normal text-white transition-all hover:bg-[#6d28d9] active:scale-[0.99]',
            pulse && 'animate-pulse',
          )}
          style={{
            boxShadow: '0px 10px 15px -3px rgba(76,29,149,0.2), 0px 4px 6px -4px rgba(76,29,149,0.2)',
          }}
        >
          Adicionar ao Carrinho
        </button>
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/5 bg-[rgba(15,23,42,0.4)] p-[17px]">
      <div className="aspect-[3/4] rounded-lg bg-[rgba(30,41,59,0.5)]" />
      <div className="h-4 w-[136px] rounded bg-[rgba(30,41,59,0.5)]" />
      <div className="h-4 w-[45px] rounded bg-[rgba(30,41,59,0.5)]" />
      <div className="h-10 w-full rounded bg-[rgba(30,41,59,0.5)]" />
    </div>
  )
}
