import { useEffect, useRef, useState } from 'react'
import * as usersService from '@/services/users.service'
import { useUsersStore } from '@/stores/usersStore'
import { NetworkError } from '@/lib/errors'
import { toast } from '@/lib/toast'

interface UseHydrateUsersResult {
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
}

/**
 * Hidrata o usersStore via GET /users da Fakestore.
 *
 * Comportamento:
 * - Hidrata UMA vez por sessão de login (enquanto `hydratedAt === null`).
 *   Refresh do browser não re-hidrata — alterações locais (criar/editar/
 *   excluir) são preservadas até o logout.
 * - O botão "Atualizar lista" usa `refresh()` (force=true) para refetch
 *   explícito quando o admin quiser ver dados frescos da API.
 * - Logout do AuthContext chama `usersStore.reset()` para limpar dados
 *   locais e permitir hidratação fresca no próximo login.
 */
export function useHydrateUsers(): UseHydrateUsersResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const setAll = useUsersStore((s) => s.setAll)
  const markHydrated = useUsersStore((s) => s.markHydrated)
  const hydratedAt = useUsersStore((s) => s.hydratedAt)
  const inFlightRef = useRef(false)

  const fetchUsers = async (force = false) => {
    if (inFlightRef.current) return
    // Sem force: só hidrata se nunca hidratou nessa sessão.
    if (!force && hydratedAt !== null) return
    inFlightRef.current = true
    setLoading(true)
    setError(null)
    try {
      const apiUsers = await usersService.list()
      if (apiUsers.length > 0) {
        // Merge: preserva usuários criados localmente. Fakestore não persiste
        // POST de verdade — sem isso, qualquer usuário criado pelo admin
        // sumiria no próximo refresh quando a hidratação substituísse a lista.
        // Dedupe por username (não por id) porque mocks e API podem usar ids
        // diferentes pra o mesmo username (kevinryan id=3 nos mocks, id=2 na
        // API), o que geraria duplicata visual na tabela.
        const apiUsernames = new Set(apiUsers.map((u) => u.username))
        const localOnly = useUsersStore
          .getState()
          .users.filter((u) => !apiUsernames.has(u.username))
        setAll([...apiUsers, ...localOnly])
        markHydrated()
      }
    } catch (err) {
      const e = err as Error
      setError(e)
      if (e instanceof NetworkError) {
        toast.info('Modo offline', {
          description:
            'Mostrando usuários em cache. Suas alterações ficam salvas localmente.',
        })
      }
    } finally {
      setLoading(false)
      inFlightRef.current = false
    }
  }

  useEffect(() => {
    void fetchUsers(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { loading, error, refresh: () => fetchUsers(true) }
}
