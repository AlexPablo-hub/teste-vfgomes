import { useMemo, useState, type FormEvent } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Users as UsersIcon,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useUsersStore } from '@/stores/usersStore'
import type { Role, User, UserDraft } from '@/types/user'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'

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
  const users = useUsersStore((s) => s.users)
  const add = useUsersStore((s) => s.add)
  const update = useUsersStore((s) => s.update)
  const remove = useUsersStore((s) => s.remove)
  const { user: currentUser } = useAuth()

  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<User | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<User | null>(null)
  const [draft, setDraft] = useState<UserDraft>(emptyDraft)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!search.trim()) return users
    const q = search.toLowerCase()
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        `${u.name.firstname} ${u.name.lastname}`.toLowerCase().includes(q),
    )
  }, [users, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

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
    else if (!/^\S+@\S+\.\S+$/.test(draft.email)) errs.email = 'E-mail inválido.'
    if (!draft.name.firstname.trim()) errs.firstname = 'Informe o primeiro nome.'
    if (!draft.name.lastname.trim()) errs.lastname = 'Informe o sobrenome.'
    if (!editing && !draft.password) errs.password = 'Defina uma senha.'

    const dup = users.find(
      (u) =>
        u.username.toLowerCase() === draft.username.toLowerCase() &&
        (!editing || u.id !== editing.id),
    )
    if (dup) errs.username = 'Já existe um usuário com este nome.'

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

  const tryRemove = (u: User) => {
    if (currentUser && u.id === currentUser.id) return
    setConfirmRemove(u)
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de clientes</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Administre as contas de admins e clientes da plataforma.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Adicionar Usuário
        </Button>
      </div>

      <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
        <Input
          placeholder="Buscar por nome, usuário ou e-mail"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          leftIcon={<Search className="h-4 w-4" />}
          aria-label="Buscar usuários"
          containerClassName="w-full sm:max-w-sm"
        />

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
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
              {paged.length === 0 ? (
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
                      <td className="py-3 pr-3 text-[var(--color-muted-foreground)]">{u.phone}</td>
                      <td className="py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(u)} aria-label={`Editar ${u.username}`}>
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
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4 text-sm sm:flex-row">
            <p className="text-[var(--color-muted-foreground)]">
              Mostrando {paged.length} de {filtered.length} usuários
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Próxima página"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar usuário' : 'Novo usuário'}
        description={editing ? `Atualize as informações de @${editing.username}.` : 'Cadastre um novo usuário no sistema.'}
        size="lg"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="user-form" variant="primary">
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
            value={draft.phone}
            onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
            containerClassName="sm:col-span-2"
          />
          <Input
            label="Cidade"
            value={draft.address.city}
            onChange={(e) => setDraft({ ...draft, address: { ...draft.address, city: e.target.value } })}
          />
          <Input
            label="CEP"
            value={draft.address.zipcode}
            onChange={(e) => setDraft({ ...draft, address: { ...draft.address, zipcode: e.target.value } })}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        onConfirm={() => confirmRemove && remove(confirmRemove.id)}
        title={`Excluir @${confirmRemove?.username ?? ''}?`}
        description="O usuário será removido permanentemente."
        destructive
        confirmLabel="Excluir"
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
