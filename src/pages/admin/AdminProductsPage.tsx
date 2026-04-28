import { useMemo, useState, type FormEvent } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Search,
  Filter as FilterIcon,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeIn, slideUp, easeLuxe } from '@/lib/motion'
import { useProductsStore } from '@/stores/productsStore'
import { categoryLabels, productCategories } from '@/data/mocks'
import {
  formatSku,
  stockStatus,
  type Product,
  type ProductDraft,
} from '@/types/product'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { formatBRL } from '@/lib/format'
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
  const products = useProductsStore((s) => s.products)
  const add = useProductsStore((s) => s.add)
  const update = useProductsStore((s) => s.update)
  const remove = useProductsStore((s) => s.remove)

  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<Product | null>(null)
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft)
  const [errors, setErrors] = useState<Partial<Record<keyof ProductDraft, string>>>({})
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!search.trim()) return products
    const q = search.toLowerCase()
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        formatSku(p).toLowerCase().includes(q),
    )
  }, [products, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (editing) update(editing.id, draft)
    else add(draft)
    setModalOpen(false)
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
              placeholder="Buscar Produtos"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              aria-label="Buscar produtos"
              className="h-10 w-full rounded-lg border border-white/10 bg-[#020617] pl-11 pr-4 text-sm font-medium tracking-[0.28px] text-white placeholder:text-[#6b7280] focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium tracking-[0.28px] text-[#94a3b8] hover:bg-white/5 hover:text-white"
            >
              <FilterIcon className="h-2.5 w-3" /> Filtrar
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

        {/* Tabela */}
        <div className="min-w-[800px] overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[rgba(2,6,23,0.5)]">
              <tr>
                <th scope="col" className="px-6 py-4 text-base font-semibold uppercase tracking-[1.6px] text-[#64748b]">
                  Imagem
                </th>
                <th scope="col" className="px-6 py-4 text-base font-semibold uppercase tracking-[1.6px] text-[#64748b]">
                  titulo
                </th>
                <th scope="col" className="px-6 py-4 text-base font-semibold uppercase tracking-[1.6px] text-[#64748b]">
                  Categoria
                </th>
                <th scope="col" className="px-6 py-4 text-base font-semibold uppercase tracking-[1.6px] text-[#64748b]">
                  Preço
                </th>
                <th scope="col" className="px-6 py-4 text-base font-semibold uppercase tracking-[1.6px] text-[#64748b]">
                  STATUS
                </th>
                <th scope="col" className="px-6 py-4 text-right text-base font-semibold uppercase tracking-[1.6px] text-[#64748b]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12">
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
            </tbody>
          </table>
        </div>

        {/* Footer (paginação) */}
        {filtered.length > 0 && (
          <div className="flex flex-col items-stretch justify-between gap-3 border-t border-white/10 bg-[rgba(2,6,23,0.5)] px-6 py-6 sm:flex-row sm:items-center">
            <p className="text-xs font-medium tracking-[0.6px] text-[#64748b]">
              Showing {paged.length} of {products.length > 100 ? 124 : products.length} products
            </p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Página anterior"
                className="grid h-7 w-7 place-items-center rounded border border-white/10 text-[#94a3b8] transition-all hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-2 w-1" />
              </button>
              <span className="text-xs font-medium tracking-[0.6px] text-[#64748b]">
                Pagina {currentPage} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Próxima página"
                className="grid h-7 w-7 place-items-center rounded border border-white/10 text-[#94a3b8] transition-all hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight className="h-2 w-1" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar produto' : 'Novo produto'}
        description={
          editing
            ? `Atualize as informações de "${editing.title}".`
            : 'Cadastre um novo produto no catálogo.'
        }
        size="lg"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="product-form" variant="primary">
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
        onClose={() => setConfirmRemove(null)}
        onConfirm={() => confirmRemove && remove(confirmRemove.id)}
        title={`Excluir "${confirmRemove?.title ?? ''}"?`}
        description="O produto será removido permanentemente."
        destructive
        confirmLabel="Excluir"
      />
    </motion.div>
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
