import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Heart, ShoppingCart, Check } from 'lucide-react'
import { useProductsStore } from '@/stores/productsStore'
import { useCartStore } from '@/stores/cartStore'
import { formatBRL } from '@/lib/format'
import { formatSku } from '@/types/product'
import { cn } from '@/lib/cn'

const sizes = [38, 40, 42, 44]

const techSpecs: Array<[string, string]> = [
  ['Material do Cabedal', 'Couro Nappa Italiano de Grão Integral e Malha Técnica'],
  ['Construção do Solado', 'Solado em TPU personalizado com haste de Fibra de Carbono'],
  ['Forro Interno', 'Microfibra Antibacteriana e Calcanhar em Couro de Bezerro'],
  ['Peso', '420g por pé (baseado no Tamanho 42)'],
  ['Origem', 'Feito à mão em Marche, Itália'],
]

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const products = useProductsStore((s) => s.products)
  const add = useCartStore((s) => s.add)
  const [selectedSize, setSelectedSize] = useState<number>(42)
  const [activeThumb, setActiveThumb] = useState(0)
  const [favorite, setFavorite] = useState(false)
  const [added, setAdded] = useState(false)

  const product = useMemo(() => products.find((p) => p.id === Number(id)), [products, id])
  const related = useMemo(
    () => products.filter((p) => p.id !== Number(id)).slice(0, 4),
    [products, id],
  )

  if (!product) return <Navigate to="/products" replace />

  const handleAdd = () => {
    add(product, 1)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

  const titleLines = product.title.split(' ').reduce<string[]>((acc, word, i, arr) => {
    if (arr.length <= 2) return [arr.join(' ')]
    if (i < Math.ceil(arr.length / 2)) acc[0] = (acc[0] ?? '') + (acc[0] ? ' ' : '') + word
    else acc[1] = (acc[1] ?? '') + (acc[1] ? ' ' : '') + word
    return acc
  }, [])

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-24 px-8 pb-24 pt-32">
      {/* Hero Section */}
      <section className="grid grid-cols-1 gap-12 lg:grid-cols-[700px_1fr]">
        {/* Imagem principal + thumbnails */}
        <div className="flex flex-col gap-4">
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[rgba(25,31,49,0.8)] backdrop-blur-[10px]">
            <div className="aspect-[700/874] w-full">
              <img
                src={product.image}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[rgba(2,6,23,0.6)] to-transparent"
            />
          </div>
          <div className="grid grid-cols-4 gap-4 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveThumb(i)}
                aria-label={`Ver imagem ${i + 1}`}
                className={cn(
                  'aspect-square overflow-hidden rounded-lg border bg-[rgba(25,31,49,0.8)] backdrop-blur-[10px] transition-all',
                  activeThumb === i ? 'border-[#7c3aed]' : 'border-transparent hover:border-white/20',
                )}
              >
                <img src={product.image} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Detalhes */}
        <div className="flex flex-col">
          <div className="flex flex-col gap-2">
            <span className="text-base uppercase tracking-[1.6px] text-[#a78bfa]">EDIÇÃO LIMITADA</span>
            <h1 className="text-5xl font-normal uppercase leading-[48px] text-[#dce1fb]">
              {titleLines[0]}
              {titleLines[1] && <><br />{titleLines[1]}</>}
            </h1>
            <div className="flex items-center gap-4 pt-2">
              <span className="text-2xl font-normal leading-8 text-white">
                {formatBRL(product.price)}
              </span>
              {(product.stock ?? 0) > 0 && (
                <span className="rounded-full bg-[rgba(124,58,237,0.3)] px-3 py-1 text-base text-[#a78bfa]">
                  Em Estoque
                </span>
              )}
            </div>
          </div>

          <p className="mt-8 text-base leading-6 text-[#94a3b8]">{product.description}</p>

          {/* Tamanhos */}
          <div className="mt-8 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-base text-[#cbd5e1]">Selecionar Tamanho</span>
              <button type="button" className="text-base text-[#a78bfa] hover:underline">
                Guia de Tamanhos
              </button>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  aria-pressed={selectedSize === s}
                  className={cn(
                    'flex h-[50px] items-center justify-center rounded-lg border text-base text-[#dce1fb] backdrop-blur-[10px] transition-all',
                    selectedSize === s
                      ? 'border-[#7c3aed] bg-[rgba(124,58,237,0.2)]'
                      : 'border-transparent bg-[rgba(25,31,49,0.8)] hover:border-white/20',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col gap-4 pt-4">
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
              onClick={() => setFavorite((f) => !f)}
              className="flex items-center justify-center gap-2 text-sm text-[#94a3b8] transition-colors hover:text-white"
            >
              <Heart
                className={cn('h-4 w-4', favorite && 'fill-[#a78bfa] text-[#a78bfa]')}
              />
              {favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            </button>
            <p className="text-center text-base tracking-[0.8px] text-[#64748b]">
              SKU: {formatSku(product)}
            </p>
          </div>
        </div>
      </section>

      {/* Especificações Técnicas */}
      <section className="flex flex-col gap-8">
        <h2 className="text-base text-white">Especificações Técnicas</h2>
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[rgba(25,31,49,0.8)] backdrop-blur-[10px]">
          <table className="w-full text-left">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                <th scope="col" className="w-1/2 p-6 text-base uppercase tracking-[0.8px] text-[#94a3b8]">
                  ATRIBUTO
                </th>
                <th scope="col" className="w-1/2 p-6 text-base uppercase tracking-[0.8px] text-[#94a3b8]">
                  DETALHES
                </th>
              </tr>
            </thead>
            <tbody>
              {techSpecs.map(([k, v], i) => (
                <tr key={k} className={cn(i < techSpecs.length - 1 && 'border-b border-white/5')}>
                  <td className="p-6 text-base text-white">{k}</td>
                  <td className="p-6 text-base text-[#94a3b8]">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Complete o Look */}
      <section className="flex flex-col gap-8">
        <div className="flex items-end justify-between">
          <h2 className="text-base text-white">Complete o Look</h2>
          <Link to="/products" className="text-base text-[#a78bfa] hover:underline">
            Ver Boutique
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {related.map((p) => (
            <RelatedCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  )
}

function RelatedCard({
  product,
}: {
  product: import('@/types/product').Product
}) {
  const [fav, setFav] = useState(false)
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
      <h3 className="text-base text-white">{product.title}</h3>
      <p className="pb-3 text-base text-[#64748b]">{formatSku(product)}</p>
      <div className="flex items-center justify-between">
        <span className="text-base text-[#a78bfa]">{formatBRL(product.price)}</span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setFav((f) => !f)
          }}
          aria-label={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className="text-white hover:text-[#a78bfa]"
        >
          <Heart className={cn('h-[18px] w-5', fav && 'fill-[#a78bfa] text-[#a78bfa]')} />
        </button>
      </div>
    </Link>
  )
}
