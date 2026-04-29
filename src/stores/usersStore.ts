import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, UserDraft } from '@/types/user'
import { mockUsers } from '@/data/mocks'

interface UsersState {
  users: User[]
  /** Timestamp da última hidratação via API. null = nunca hidratou. */
  hydratedAt: number | null

  // Mutations locais
  add: (draft: UserDraft) => User
  update: (id: number, patch: Partial<UserDraft>) => void
  remove: (id: number) => void
  findByCredentials: (username: string, password: string) => User | undefined

  // Hidratação via API
  setAll: (users: User[]) => void
  markHydrated: () => void

  reset: () => void
}

export const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
      users: mockUsers,
      hydratedAt: null,

      add: (draft) => {
        const id = Math.max(0, ...get().users.map((u) => u.id)) + 1
        const created: User = { id, ...draft }
        set((s) => ({ users: [...s.users, created] }))
        return created
      },
      update: (id, patch) =>
        set((s) => ({
          users: s.users.map((u) =>
            u.id === id
              ? {
                  ...u,
                  ...patch,
                  name: { ...u.name, ...patch.name },
                  address: { ...u.address, ...patch.address },
                }
              : u,
          ),
        })),
      remove: (id) => set((s) => ({ users: s.users.filter((u) => u.id !== id) })),
      findByCredentials: (username, password) =>
        get().users.find((u) => u.username === username && u.password === password),

      setAll: (users) => set({ users }),
      markHydrated: () => set({ hydratedAt: Date.now() }),

      reset: () => set({ users: mockUsers, hydratedAt: null }),
    }),
    {
      name: 'fakestore-users',
      storage: createJSONStorage(() => localStorage),
      version: 2,
    },
  ),
)
