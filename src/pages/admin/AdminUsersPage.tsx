import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Users as UsersIcon,
  Search,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { useUsersStore } from '@/stores/usersStore'
import { useHydrateUsers } from '@/hooks/useHydrateUsers'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import * as usersService from '@/services/users.service'
import type { Role, User, UserDraft } from '@/types/user'
import { NetworkError } from '@/lib/errors'
import { toast } from '@/lib/toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import { formatPhoneBR, maskPhoneBR, maskCEP, isValidEmail } from '@/lib/format'

const emptyDraft: UserDraft = {
  email: '',
  username: '',
  password: '',
  name: { firstname: '', lastname: '' },
  address: {
    city: '',
    street: '',
    number: 0,
    zipcode: '',
    geolocation: { lat: '0', long: '0' },
  },
  phone: '',
  role: 'client',
}

const PAGE_SIZE = 8

export function AdminUsersPage() {
  useDocumentTitle('Admin - Clientes')

  const users = useUsersStore((s) => s.users)
  const add = useUsersStore((s) => s.add)
  const update = useUsersStore((s) => s.update)
  const remove = useUsersStore((s) => s.remove)
  const { user: currentUser } = useAuth()

  // Hidrata via Fakestore /users no mount
  const { loading: hydrating, error: hydrateError, refresh } = useHydrateUsers()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all')
  const [refreshing, setRefreshing] = useState(false)

  const handleManualRefresh = async () => {
    setRefreshing(true)
    try {
      await refresh()
    } finally {
      setRefreshing(false)
    }
  }
  const [editing, setEditing] = useState<User | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<User | null>(null)
  const [draft, setDraft] = useState<UserDraft>(emptyDraft)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (!q) return true
      return (
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        `${u.name.firstname} ${u.name.lastname}`.toLowerCase().includes(q)
      )
    })
  }, [users, search, roleFilter])

  // Reseta janela visível quando filtros mudam, pra não preservar scroll
  // num resultado vazio ou irrelevante.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [search, roleFilter])

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

  const openEdit = (u: User) => {
    setEditing(u)
    setDraft({
      email: u.email,
      username: u.username,
      password: u.password,
      name: { ...u.name },
      address: { ...u.address, geolocation: { ...u.address.geolocation } },
      phone: u.phone,
      role: u.role,
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!draft.username.trim()) errs.username = 'Informe um nome de usuário.'
    if (!draft.email.trim()) errs.email = 'Informe um e-mail.'
    else if (!isValidEmail(draft.email)) errs.email = 'E-mail inválido (ex: nome@dominio.com).'
    if (!draft.name.firstname.trim()) errs.firstname = 'Informe o primeiro nome.'
    if (!draft.name.lastname.trim()) errs.lastname = 'Informe o sobrenome.'
    if (!editing && !draft.password) errs.password = 'Defina uma senha.'

    // Telefone: o valor já vem mascarado ('+55 XX XXXXX-XXXX'), então primeiro
    // descarta o country code +55 antes de contar dígitos do número BR.
    const phoneNational = draft.phone.startsWith('+55') ? draft.phone.slice(3) : draft.phone
    const phoneDigits = phoneNational.replace(/\D/g, '')
    if (!phoneDigits) errs.phone = 'Informe um telefone.'
    else if (phoneDigits.length !== 10 && phoneDigits.length !== 11) {
      errs.phone = 'Telefone incompleto (ex: +55 11 98765-4321).'
    }

    // Endereço (campos visíveis no form)
    if (!draft.address.city.trim()) errs.city = 'Informe a cidade.'
    const cepDigits = draft.address.zipcode.replace(/\D/g, '')
    if (!cepDigits) errs.zipcode = 'Informe o CEP.'
    else if (cepDigits.length !== 8) errs.zipcode = 'CEP incompleto (8 dígitos).'

    const dup = users.find(
      (u) =>
        u.username.toLowerCase() === draft.username.toLowerCase() &&
        (!editing || u.id !== editing.id),
    )
    if (dup) errs.username = 'Já existe um usuário com este nome.'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  /**
   * Mesmo padrão híbrido do AdminProductsPage:
   * - Optimistic local (UX instantânea + persist garantido)
   * - API call em paralelo (consumo da Fakestore visível no Network)
   * - Toast feedback diferenciado por classe de erro
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)

    try {
      if (editing) {
        update(editing.id, draft)
        await usersService.update(editing.id, draft)
        toast.success('Usuário atualizado.')
      } else {
        add(draft)
        await usersService.create(draft)
        toast.success('Usuário criado.')
      }
      setModalOpen(false)
    } catch (err) {
      setModalOpen(false)
      if (err instanceof NetworkError) {
        toast.info('Salvo localmente', {
          description: 'API indisponível — sincronização ficará pendente.',
        })
      } else {
        console.error('[admin/clientes] save failed:', err)
        toast.error('Falha ao sincronizar com o servidor.', {
          description: 'A alteração foi salva localmente.',
        })
      }
    } finally {
      setSaving(false)
    }
  }

  const tryRemove = (u: User) => {
    if (currentUser && u.id === currentUser.id) return
    setConfirmRemove(u)
  }

  const handleConfirmRemove = async () => {
    if (!confirmRemove) return
    const u = confirmRemove
    setDeleting(true)
    try {
      remove(u.id)
      await usersService.remove(u.id)
      toast.success('Usuário excluído.')
    } catch (err) {
      if (err instanceof NetworkError) {
        toast.info('Excluído localmente', {
          description: 'API indisponível — sincronização pendente.',
        })
      } else {
        console.error('[admin/clientes] delete failed:', err)
        toast.error('Falha ao sincronizar exclusão com o servidor.')
      }
    } finally {
      setDeleting(false)
      setConfirmRemove(null)
    }
  }

  const showHardError = hydrateError && users.length === 0

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de clientes</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Administre as contas de admins e clientes da plataforma.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleManualRefresh}
            disabled={hydrating || refreshing}
            aria-label="Atualizar lista"
            title="Buscar novamente da API"
          >
            <RefreshCw className={cn('h-4 w-4', (hydrating || refreshing) && 'animate-spin')} />
            Atualizar
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Adicionar Usuário
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            label="Busca"
            placeholder="Buscar por nome, usuário ou e-mail"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            aria-label="Buscar usuários"
            containerClassName="w-full sm:max-w-sm"
          />
          <div className="w-full sm:w-44">
            <Select
              label="Papel"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | Role)}
              aria-label="Filtrar por papel"
            >
              <option value="all">Todos</option>
              <option value="admin">Admin</option>
              <option value="client">Cliente</option>
            </Select>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <caption className="sr-only">Lista de usuários administradores e clientes</caption>
            <thead className="border-b border-[var(--color-border)] text-[var(--color-muted-foreground)]">
              <tr className="label-caps">
                <th scope="col" className="py-3 pr-3 font-medium">Nome</th>
                <th scope="col" className="py-3 pr-3 font-medium">E-mail</th>
                <th scope="col" className="py-3 pr-3 font-medium">Papel</th>
                <th scope="col" className="py-3 pr-3 font-medium">Telefone</th>
                <th scope="col" className="py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {showHardError ? (
                <tr>
                  <td colSpan={5} className="py-12">
                    <EmptyState
                      icon={<AlertCircle className="h-6 w-6" />}
                      title="Falha ao carregar usuários"
                      description={hydrateError?.message ?? 'Verifique sua conexão e tente novamente.'}
                      action={
                        <Button onClick={refresh} loading={hydrating}>
                          <RefreshCw className="h-4 w-4" /> Tentar novamente
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (hydrating && users.length === 0) || refreshing ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={`skeleton-${i}`} />)
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12">
                    <EmptyState
                      icon={<UsersIcon className="h-6 w-6" />}
                      title="Nenhum usuário encontrado"
                      description={search ? 'Tente outra busca.' : 'Comece criando o primeiro usuário.'}
                      action={
                        <Button onClick={openCreate}>
                          <Plus className="h-4 w-4" /> Adicionar Usuário
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                paged.map((u) => {
                  const isSelf = currentUser?.id === u.id
                  return (
                    <tr key={u.id} className="transition-colors hover:bg-[var(--color-muted)]/40">
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--color-primary)]/20 text-xs font-semibold text-[var(--color-primary)]">
                            {u.name.firstname[0]?.toUpperCase()}
                          </span>
                          <div>
                            <p className="font-medium">
                              {u.name.firstname} {u.name.lastname}
                            </p>
                            <p className="text-xs text-[var(--color-muted-foreground)]">@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-[var(--color-muted-foreground)]">{u.email}</td>
                      <td className="py-3 pr-3">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="py-3 pr-3 text-[var(--color-muted-foreground)]">{formatPhoneBR(u.phone)}</td>
                      <td className="py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(u)}
                            aria-label={`Editar ${u.username}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-[var(--color-destructive)]"
                            onClick={() => tryRemove(u)}
                            disabled={isSelf}
                            aria-label={`Excluir ${u.username}`}
                            title={isSelf ? 'Você não pode se excluir' : undefined}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
              {hasMore && (
                <tr ref={sentinelRef} aria-hidden>
                  <td colSpan={5} className="py-4 text-center text-xs text-[var(--color-muted-foreground)]">
                    Carregando mais…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="mt-5 border-t border-[var(--color-border)] pt-4 text-center text-sm text-[var(--color-muted-foreground)]">
            {hasMore
              ? `Mostrando ${paged.length} de ${filtered.length} ${filtered.length === 1 ? 'usuário' : 'usuários'} — role para carregar mais`
              : `${filtered.length} ${filtered.length === 1 ? 'usuário' : 'usuários'} no total`}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editing ? 'Editar usuário' : 'Novo usuário'}
        description={editing ? `Atualize as informações de @${editing.username}.` : 'Cadastre um novo usuário no sistema.'}
        size="lg"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" form="user-form" variant="primary" loading={saving}>
              {editing ? 'Salvar alterações' : 'Criar usuário'}
            </Button>
          </>
        }
      >
        <form id="user-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
          <Input
            label="Primeiro nome"
            value={draft.name.firstname}
            onChange={(e) => setDraft({ ...draft, name: { ...draft.name, firstname: e.target.value } })}
            error={errors.firstname}
            required
          />
          <Input
            label="Sobrenome"
            value={draft.name.lastname}
            onChange={(e) => setDraft({ ...draft, name: { ...draft.name, lastname: e.target.value } })}
            error={errors.lastname}
            required
          />
          <Input
            label="Usuário"
            value={draft.username}
            onChange={(e) => setDraft({ ...draft, username: e.target.value })}
            error={errors.username}
            required
          />
          <Input
            label="E-mail"
            type="email"
            value={draft.email}
            onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            error={errors.email}
            placeholder="ex: nome@dominio.com"
            required
          />
          <Input
            label={editing ? 'Senha (deixe igual para manter)' : 'Senha'}
            type="password"
            value={draft.password}
            onChange={(e) => setDraft({ ...draft, password: e.target.value })}
            error={errors.password}
          />
          <Select
            label="Papel"
            value={draft.role}
            onChange={(e) => setDraft({ ...draft, role: e.target.value as Role })}
          >
            <option value="client">Cliente</option>
            <option value="admin">Admin</option>
          </Select>
          <Input
            label="Telefone"
            value={maskPhoneBR(draft.phone)}
            onChange={(e) => setDraft({ ...draft, phone: maskPhoneBR(e.target.value) })}
            error={errors.phone}
            placeholder="ex: +55 11 98765-4321"
            inputMode="tel"
            required
            containerClassName="sm:col-span-2"
          />
          <Input
            label="Cidade"
            value={draft.address.city}
            onChange={(e) => setDraft({ ...draft, address: { ...draft.address, city: e.target.value } })}
            error={errors.city}
            required
          />
          <Input
            label="CEP"
            value={maskCEP(draft.address.zipcode)}
            onChange={(e) =>
              setDraft({
                ...draft,
                address: { ...draft.address, zipcode: maskCEP(e.target.value) },
              })
            }
            error={errors.zipcode}
            placeholder="ex: 12.345-678"
            inputMode="numeric"
            required
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmRemove}
        onClose={() => !deleting && setConfirmRemove(null)}
        onConfirm={handleConfirmRemove}
        title={`Excluir @${confirmRemove?.username ?? ''}?`}
        description="O usuário será removido permanentemente."
        destructive
        confirmLabel={deleting ? 'Excluindo…' : 'Excluir'}
      />
    </div>
  )
}

function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
        role === 'admin'
          ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)] border-[var(--color-primary)]/30'
          : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)] border-[var(--color-border)]',
      )}
    >
      {role === 'admin' ? 'Admin' : 'Cliente'}
    </span>
  )
}

/** Skeleton de linha (shimmer) durante hidratação inicial. */
function SkeletonRow() {
  return (
    <tr className="animate-pulse" aria-hidden>
      <td className="py-3 pr-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[var(--color-muted)]" />
          <div className="space-y-2">
            <div className="h-3 w-32 rounded bg-[var(--color-muted)]" />
            <div className="h-2.5 w-20 rounded bg-[var(--color-muted)]/60" />
          </div>
        </div>
      </td>
      <td className="py-3 pr-3">
        <div className="h-3 w-40 rounded bg-[var(--color-muted)]" />
      </td>
      <td className="py-3 pr-3">
        <div className="h-4 w-16 rounded bg-[var(--color-muted)]" />
      </td>
      <td className="py-3 pr-3">
        <div className="h-3 w-28 rounded bg-[var(--color-muted)]" />
      </td>
      <td className="py-3 text-right">
        <div className="ml-auto h-6 w-14 rounded bg-[var(--color-muted)]/60" />
      </td>
    </tr>
  )
}
