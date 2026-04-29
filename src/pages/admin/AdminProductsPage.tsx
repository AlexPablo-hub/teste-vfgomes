import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Search,
  Filter as FilterIcon,
  Download,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  AlertCircle,
  Star,
  X,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeIn, slideUp, easeLuxe } from '@/lib/motion'
import { useProductsStore } from '@/stores/productsStore'
import { useHydrateProducts } from '@/hooks/useHydrateProducts'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import * as productsService from '@/services/products.service'
import { categoryLabels, productCategories, type CategorySlug } from '@/data/mocks'
import {
  formatSku,
  stockStatus,
  type Product,
  type ProductDraft,
} from '@/types/product'
import { NetworkError } from '@/lib/errors'
import { toast } from '@/lib/toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { formatBRL, maskBRL, parseBRL } from '@/lib/format'
import { cn } from '@/lib/cn'

const emptyDraft: ProductDraft = {
  title: '',
  price: 0,
  description: '',
  category: productCategories[0],
  image: '/images/coat.jpg',
  stock: 10,
}

const PAGE_SIZE = 8

export function AdminProductsPage() {
  useDocumentTitle('Admin - Estoque')

  const products = useProductsStore((s) => s.products)
  const add = useProductsStore((s) => s.add)
  const update = useProductsStore((s) => s.update)
  const remove = useProductsStore((s) => s.remove)

  // Hidrata via Fakestore /products no mount. Loading + error são expostos.
  const { loading: hydrating, error: hydrateError, refresh } = useHydrateProducts()

  const handleManualRefresh = async () => {
    setRefreshing(true)
    try {
      await refresh()
    } finally {
      setRefreshing(false)
    }
  }

  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterCategory, setFilterCategory] = useState<'all' | CategorySlug>('all')
  const [filterRating, setFilterRating] = useState<'all' | '1' | '2' | '3' | '4'>('all')
  const [filterPriceMin, setFilterPriceMin] = useState('')
  const [filterPriceMax, setFilterPriceMax] = useState('')
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | null>(null)
  const [editing, setEditing] = useState<Product | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<Product | null>(null)
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft)
  const [errors, setErrors] = useState<Partial<Record<keyof ProductDraft, string>>>({})
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const min = filterPriceMin ? parseBRL(filterPriceMin) : null
    const max = filterPriceMax ? parseBRL(filterPriceMax) : null
    const ratingFloor = filterRating === 'all' ? null : Number(filterRating)
    const result = products.filter((p) => {
      if (filterCategory !== 'all' && p.category !== filterCategory) return false
      if (ratingFloor !== null && p.rating.rate < ratingFloor) return false
      if (min !== null && p.price < min) return false
      if (max !== null && p.price > max) return false
      if (!q) return true
      return (
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        formatSku(p).toLowerCase().includes(q)
      )
    })
    if (priceSort) {
      const sign = priceSort === 'asc' ? 1 : -1
      result.sort((a, b) => sign * (a.price - b.price))
    }
    return result
  }, [products, search, filterCategory, filterRating, filterPriceMin, filterPriceMax, priceSort])

  const togglePriceSort = () => {
    setPriceSort((prev) => (prev === null ? 'asc' : prev === 'asc' ? 'desc' : null))
  }

  const activeFilterCount =
    (filterCategory !== 'all' ? 1 : 0) +
    (filterRating !== 'all' ? 1 : 0) +
    (filterPriceMin ? 1 : 0) +
    (filterPriceMax ? 1 : 0)

  const clearFilters = () => {
    setFilterCategory('all')
    setFilterRating('all')
    setFilterPriceMin('')
    setFilterPriceMax('')
  }

  // Reseta janela visível quando filtros/busca/ordenação mudam.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [search, filterCategory, filterRating, filterPriceMin, filterPriceMax, priceSort])

  const paged = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const sentinelRef = useInfiniteScroll<HTMLTableRowElement>(
    () => setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length)),
    hasMore,
  )

  const openCreate = () => {
    setEditing(null)
    setDraft(emptyDraft)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setDraft({
      title: p.title,
      price: p.price,
      description: p.description,
      category: p.category,
      image: p.image,
      stock: p.stock ?? 0,
      sku: p.sku,
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const errs: typeof errors = {}
    if (!draft.title.trim()) errs.title = 'Informe o título.'
    if (!draft.image.trim()) errs.image = 'Informe a URL da imagem.'
    if (!draft.description.trim()) errs.description = 'Informe a descrição.'
    if (draft.price <= 0) errs.price = 'Preço deve ser maior que zero.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  /**
   * Submit do form de criar/editar.
   *
   * Estratégia híbrida (combinada com o README):
   * - Atualização local do store (Zustand persist) — UX instantânea, persiste
   *   reload mesmo se a API falhar.
   * - Chamada de API em paralelo (POST /products ou PUT /products/:id) —
   *   demonstra consumo da Fakestore no Network tab. Como a Fakestore não
   *   persiste de verdade, o sucesso é só simbólico.
   * - Em NetworkError (sem internet), faz fallback offline com toast info.
   * - Em outros erros, exibe toast de erro e mantém o save local.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)

    try {
      if (editing) {
        // Optimistic: atualiza store
        update(editing.id, draft)
        // Chama API
        await productsService.update(editing.id, draft)
        toast.success('Produto atualizado.')
      } else {
        // Optimistic: cria local. Fakestore não persiste, então o id local manda.
        add(draft)
        await productsService.create(draft)
        toast.success('Produto criado.')
      }
      setModalOpen(false)
    } catch (err) {
      setModalOpen(false)
      if (err instanceof NetworkError) {
        toast.info('Salvo localmente', {
          description: 'API indisponível — sincronização ficará pendente.',
        })
      } else {
        console.error('[admin/produtos] save failed:', err)
        toast.error('Falha ao sincronizar com o servidor.', {
          description: 'A alteração foi salva localmente.',
        })
      }
    } finally {
      setSaving(false)
    }
  }

  /** Confirma exclusão: chama DELETE /products/:id + remove do store. */
  const handleConfirmRemove = async () => {
    if (!confirmRemove) return
    const p = confirmRemove
    setDeleting(true)
    try {
      remove(p.id) // Optimistic
      await productsService.remove(p.id)
      toast.success('Produto excluído.')
    } catch (err) {
      if (err instanceof NetworkError) {
        toast.info('Excluído localmente', {
          description: 'API indisponível — sincronização pendente.',
        })
      } else {
        console.error('[admin/produtos] delete failed:', err)
        toast.error('Falha ao sincronizar exclusão com o servidor.')
      }
    } finally {
      setDeleting(false)
      setConfirmRemove(null)
    }
  }

  const handleExport = () => {
    const csv = [
      ['SKU', 'Título', 'Categoria', 'Preço', 'Estoque'].join(','),
      ...filtered.map((p) =>
        [formatSku(p), JSON.stringify(p.title), p.category, p.price, p.stock ?? 0].join(','),
      ),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `noir-luxe-estoque-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Mostra estado de erro com retry quando a hidratação inicial falhou
  // E não há fallback no store (caso raro). Se houver mocks/cache, é só toast.
  const showHardError = hydrateError && products.length === 0

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="px-8 pb-12 pt-8"
    >
      {/* Cabeçalho da seção */}
      <motion.div
        variants={slideUp}
        initial="hidden"
        animate="visible"
        className="flex items-end justify-between gap-4 pb-8"
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold leading-9 tracking-[-0.3px] text-white">
            Gestão de estoque
          </h1>
          <p className="text-base leading-[25.6px] text-[#94a3b8]">
            Gerencie seu catálogo de produtos e níveis de estoque
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex h-12 items-center gap-2 rounded-lg bg-[#7c3aed] px-6 text-base text-white transition-all hover:bg-[#6d28d9] active:scale-[0.99]"
          style={{
            boxShadow: '0px 10px 15px -3px rgba(124,58,237,0.2), 0px 4px 6px -4px rgba(124,58,237,0.2)',
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar Produto
        </button>
      </motion.div>

      {/* Card com tabela */}
      <motion.div
        variants={slideUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.15 }}
        className="overflow-hidden rounded-xl border border-white/10 bg-[rgba(15,23,42,0.8)] backdrop-blur-[10px]"
        style={{ boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.4)' }}
      >
        {/* Toolbar */}
        <div className="flex flex-col items-stretch justify-between gap-3 border-b border-white/10 bg-[rgba(15,23,42,0.5)] px-6 py-6 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#6b7280]" />
            <input
              type="text"
              placeholder="Buscar produtos"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar produtos"
              className="h-10 w-full rounded-lg border border-white/10 bg-[#020617] pl-11 pr-4 text-sm font-medium tracking-[0.28px] text-white placeholder:text-[#6b7280] focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={hydrating || refreshing}
              aria-label="Atualizar lista"
              title="Buscar novamente da API"
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium tracking-[0.28px] text-[#94a3b8] hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={cn('h-3 w-3', (hydrating || refreshing) && 'animate-spin')} />
              Atualizar
            </button>
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              aria-label="Filtrar produtos"
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium tracking-[0.28px] text-[#94a3b8] hover:bg-white/5 hover:text-white"
            >
              <FilterIcon className="h-2.5 w-3" /> Filtrar
              {activeFilterCount > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1.5 text-[10px] font-bold text-[var(--color-primary-foreground)]">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium tracking-[0.28px] text-[#94a3b8] hover:bg-white/5 hover:text-white"
            >
              <Download className="h-2.5 w-2.5" /> Exportar
            </button>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-[rgba(15,23,42,0.3)] px-6 py-3">
            <span className="text-xs uppercase tracking-[1.2px] text-[#64748b]">
              Filtros ativos:
            </span>
            {filterCategory !== 'all' && (
              <FilterTag
                label={`Categoria: ${categoryLabels[filterCategory]}`}
                onRemove={() => setFilterCategory('all')}
              />
            )}
            {filterRating !== 'all' && (
              <FilterTag
                label={`Avaliação ≥ ${filterRating}★`}
                onRemove={() => setFilterRating('all')}
              />
            )}
            {filterPriceMin && (
              <FilterTag
                label={`Preço ≥ ${filterPriceMin}`}
                onRemove={() => setFilterPriceMin('')}
              />
            )}
            {filterPriceMax && (
              <FilterTag
                label={`Preço ≤ ${filterPriceMax}`}
                onRemove={() => setFilterPriceMax('')}
              />
            )}
            <button
              type="button"
              onClick={clearFilters}
              className="ml-1 text-xs uppercase tracking-[1px] text-[#94a3b8] underline-offset-2 hover:text-white hover:underline"
            >
              Limpar tudo
            </button>
          </div>
        )}

        {/* Tabela */}
        <div className="min-w-[800px] overflow-x-auto">
          <table className="w-full text-left">
            <caption className="sr-only">Lista de produtos do estoque</caption>
            <thead className="bg-[rgba(2,6,23,0.5)]">
              <tr>
                <th scope="col" className="px-6 py-4 text-base font-semibold uppercase tracking-[1.6px] text-[#64748b]">
                  Imagem
                </th>
                <th scope="col" className="px-6 py-4 text-base font-semibold uppercase tracking-[1.6px] text-[#64748b]">
                  Título
                </th>
                <th scope="col" className="px-6 py-4 text-base font-semibold uppercase tracking-[1.6px] text-[#64748b]">
                  Categoria
                </th>
                <th scope="col" aria-sort={priceSort === 'asc' ? 'ascending' : priceSort === 'desc' ? 'descending' : 'none'} className="px-6 py-4 text-base font-semibold uppercase tracking-[1.6px] text-[#64748b]">
                  <button
                    type="button"
                    onClick={togglePriceSort}
                    title={`Ordenar ${priceSort === 'asc' ? 'descendente' : priceSort === 'desc' ? 'sem ordenação' : 'ascendente'}`}
                    className="flex items-center gap-1.5 text-base font-semibold uppercase tracking-[1.6px] text-[#64748b] transition-colors hover:text-white"
                  >
                    Preço
                    {priceSort === 'asc' ? (
                      <ArrowUp className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                    ) : priceSort === 'desc' ? (
                      <ArrowDown className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                    ) : (
                      <ChevronsUpDown className="h-3.5 w-3.5 opacity-60" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-4 text-base font-semibold uppercase tracking-[1.6px] text-[#64748b]">
                  Avaliação
                </th>
                <th scope="col" className="px-6 py-4 text-base font-semibold uppercase tracking-[1.6px] text-[#64748b]">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-right text-base font-semibold uppercase tracking-[1.6px] text-[#64748b]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {showHardError ? (
                <tr>
                  <td colSpan={7} className="py-12">
                    <EmptyState
                      icon={<AlertCircle className="h-6 w-6" />}
                      title="Falha ao carregar produtos"
                      description={hydrateError?.message ?? 'Verifique sua conexão e tente novamente.'}
                      action={
                        <Button onClick={refresh} loading={hydrating}>
                          <RefreshCw className="h-4 w-4" /> Tentar novamente
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (hydrating && products.length === 0) || refreshing ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={`skeleton-${i}`} index={i} />
                ))
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12">
                    <EmptyState
                      icon={<Package className="h-6 w-6" />}
                      title="Nenhum produto encontrado"
                      description={
                        search
                          ? 'Tente outra busca ou crie um novo produto.'
                          : 'Comece criando seu primeiro produto.'
                      }
                      action={
                        <Button onClick={openCreate}>
                          <Plus className="h-4 w-4" /> Adicionar Produto
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                paged.map((p, i) => {
                  const status = stockStatus(p)
                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, x: -24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.12, duration: 0.8, ease: easeLuxe }}
                      className={cn(
                        'transition-colors hover:bg-white/[0.02]',
                        i > 0 && 'border-t border-white/5',
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="grid h-12 w-12 place-items-center overflow-hidden rounded border border-white/10 bg-[#1e293b]">
                          <img
                            src={p.image}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <p className="text-sm font-medium tracking-[0.28px] text-white">
                          {p.title}
                        </p>
                        <p className="text-xs leading-4 text-[#64748b]">SKU: {formatSku(p)}</p>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-sm font-medium tracking-[0.28px] text-[#94a3b8]">
                          {(categoryLabels as Record<string, string>)[p.category] ?? p.category}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-sm font-bold tracking-[0.28px] text-white">
                          {formatBRL(p.price)}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-1.5">
                          <Star className="h-3.5 w-3.5 fill-[#facc15] text-[#facc15]" />
                          <span className="text-sm font-semibold text-white">
                            {p.rating.rate.toFixed(1)}
                          </span>
                          <span className="text-xs text-[#64748b]">({p.rating.count})</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(p)}
                            aria-label={`Editar ${p.title}`}
                            className="grid h-8 w-8 place-items-center rounded-lg text-[#94a3b8] transition-colors hover:bg-white/5 hover:text-white"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmRemove(p)}
                            aria-label={`Excluir ${p.title}`}
                            className="grid h-8 w-8 place-items-center rounded-lg text-[#94a3b8] transition-colors hover:bg-white/5 hover:text-[#f87171]"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
              {hasMore && (
                <tr ref={sentinelRef} aria-hidden>
                  <td colSpan={7} className="px-6 py-4 text-center text-xs text-[#64748b]">
                    Carregando mais…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer (rolagem infinita) */}
        {filtered.length > 0 && (
          <div className="border-t border-white/10 bg-[rgba(2,6,23,0.5)] px-6 py-6 text-center text-xs font-medium tracking-[0.6px] text-[#64748b]">
            {hasMore
              ? `Mostrando ${paged.length} de ${filtered.length} ${filtered.length === 1 ? 'produto' : 'produtos'} — role para carregar mais`
              : `${filtered.length} ${filtered.length === 1 ? 'produto' : 'produtos'} no total`}
          </div>
        )}
      </motion.div>

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editing ? 'Editar produto' : 'Novo produto'}
        description={
          editing
            ? `Atualize as informações de "${editing.title}".`
            : 'Cadastre um novo produto no catálogo.'
        }
        size="lg"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" form="product-form" variant="primary" loading={saving}>
              {editing ? 'Salvar alterações' : 'Criar produto'}
            </Button>
          </>
        }
      >
        <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
          <Input
            label="Título"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            error={errors.title}
            containerClassName="sm:col-span-2"
            required
          />
          <Input
            label="Preço (R$)"
            type="number"
            step="0.01"
            min={0}
            value={draft.price || ''}
            onChange={(e) => setDraft({ ...draft, price: parseFloat(e.target.value) || 0 })}
            error={errors.price}
            required
          />
          <Input
            label="Estoque"
            type="number"
            min={0}
            value={draft.stock ?? 0}
            onChange={(e) => setDraft({ ...draft, stock: parseInt(e.target.value, 10) || 0 })}
          />
          <Select
            label="Categoria"
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
          >
            {productCategories.map((c) => (
              <option key={c} value={c}>
                {categoryLabels[c]}
              </option>
            ))}
          </Select>
          <Input
            label="SKU (opcional)"
            value={draft.sku ?? ''}
            onChange={(e) => setDraft({ ...draft, sku: e.target.value })}
            placeholder="Auto-gerado se vazio"
          />
          <Input
            label="URL da imagem"
            value={draft.image}
            onChange={(e) => setDraft({ ...draft, image: e.target.value })}
            error={errors.image}
            containerClassName="sm:col-span-2"
            placeholder="/images/... ou https://..."
            required
          />
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="product-description" className="text-sm font-medium">
              Descrição
            </label>
            <textarea
              id="product-description"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-[var(--color-input)] p-3 text-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30"
            />
            {errors.description && <p className="text-xs text-[#f87171]">{errors.description}</p>}
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmRemove}
        onClose={() => !deleting && setConfirmRemove(null)}
        onConfirm={handleConfirmRemove}
        title={`Excluir "${confirmRemove?.title ?? ''}"?`}
        description="O produto será removido permanentemente."
        destructive
        confirmLabel={deleting ? 'Excluindo…' : 'Excluir'}
      />

      <Modal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filtrar produtos"
        description="Refine a lista por categoria, status do estoque ou faixa de preço."
        footer={
          <>
            <Button type="button" variant="ghost" onClick={clearFilters}>
              Limpar
            </Button>
            <Button type="button" variant="primary" onClick={() => setFilterOpen(false)}>
              Aplicar
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4">
          <Select
            label="Categoria"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as 'all' | CategorySlug)}
          >
            <option value="all">Todas</option>
            {productCategories.map((slug) => (
              <option key={slug} value={slug}>
                {categoryLabels[slug]}
              </option>
            ))}
          </Select>
          <Select
            label="Avaliação mínima"
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value as typeof filterRating)}
          >
            <option value="all">Todas</option>
            <option value="4">4★ ou mais</option>
            <option value="3">3★ ou mais</option>
            <option value="2">2★ ou mais</option>
            <option value="1">1★ ou mais</option>
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Preço mínimo"
              type="text"
              inputMode="numeric"
              placeholder="R$ 0,00"
              value={filterPriceMin}
              onChange={(e) => setFilterPriceMin(maskBRL(e.target.value))}
            />
            <Input
              label="Preço máximo"
              type="text"
              inputMode="numeric"
              placeholder="R$ 9.999,00"
              value={filterPriceMax}
              onChange={(e) => setFilterPriceMax(maskBRL(e.target.value))}
            />
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}

interface FilterTagProps {
  label: string
  onRemove: () => void
}

function FilterTag({ label, onRemove }: FilterTagProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/15 px-3 py-1 text-xs font-medium text-white">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remover filtro ${label}`}
        className="grid h-4 w-4 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}

interface StatusBadgeProps {
  status: 'in-stock' | 'low' | 'out'
}

function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    'in-stock': {
      label: 'em estoque',
      className: 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.2)] text-[#34d399]',
    },
    low: {
      label: 'estoque baixo',
      className: 'bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)] text-[#fbbf24]',
    },
    out: {
      label: 'esgotado',
      className: 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.2)] text-[#f87171]',
    },
  }[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.5px]',
        config.className,
      )}
    >
      {config.label}
    </span>
  )
}

/** Skeleton de linha (shimmer) durante hidratação inicial. */
function SkeletonRow({ index }: { index: number }) {
  return (
    <tr
      className={cn('animate-pulse', index > 0 && 'border-t border-white/5')}
      aria-hidden
    >
      <td className="px-6 py-4">
        <div className="h-12 w-12 rounded border border-white/10 bg-[#1e293b]" />
      </td>
      <td className="px-6 py-6">
        <div className="h-4 w-40 rounded bg-white/10" />
        <div className="mt-2 h-3 w-20 rounded bg-white/5" />
      </td>
      <td className="px-6 py-6">
        <div className="h-4 w-20 rounded bg-white/10" />
      </td>
      <td className="px-6 py-6">
        <div className="h-4 w-16 rounded bg-white/10" />
      </td>
      <td className="px-6 py-6">
        <div className="h-4 w-12 rounded bg-white/10" />
      </td>
      <td className="px-6 py-6">
        <div className="h-5 w-24 rounded bg-white/10" />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="ml-auto h-8 w-16 rounded bg-white/5" />
      </td>
    </tr>
  )
}
