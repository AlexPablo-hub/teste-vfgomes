import { useEffect, useRef, useState } from 'react'
import * as productsService from '@/services/products.service'
import { useProductsStore } from '@/stores/productsStore'
import { NetworkError } from '@/lib/errors'
import { toast } from '@/lib/toast'

interface UseHydrateProductsResult {
  loading: boolean
  error: Error | null
  /** Força um refetch ignorando o cache. */
  refresh: () => Promise<void>
}

/**
 * Hidrata o productsStore via GET /products da Fakestore.
 *
 * Comportamento:
 * - Hidrata UMA vez por sessão (enquanto `hydratedAt === null`). Refresh
 *   do browser não dispara nova chamada — mutações locais ficam intactas.
 * - `refresh()` (botão Atualizar) força refetch.
 * - Logout do AuthContext reseta o store para permitir hidratação fresca
 *   no próximo login.
 */
export function useHydrateProducts(): UseHydrateProductsResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const setAll = useProductsStore((s) => s.setAll)
  const markHydrated = useProductsStore((s) => s.markHydrated)
  const hydratedAt = useProductsStore((s) => s.hydratedAt)
  // Evita re-fetch em re-renders enquanto a primeira request está em voo
  const inFlightRef = useRef(false)

  const fetchProducts = async (force = false) => {
    if (inFlightRef.current) return
    if (!force && hydratedAt !== null) return
    inFlightRef.current = true
    setLoading(true)
    setError(null)
    try {
      const apiProducts = await productsService.list()
      if (apiProducts.length > 0) {
        setAll(apiProducts)
        markHydrated()
      }
    } catch (err) {
      const e = err as Error
      setError(e)
      if (e instanceof NetworkError) {
        toast.info('Modo offline', {
          description:
            'Mostrando catálogo em cache. Suas alterações ficam salvas localmente.',
        })
      }
    } finally {
      setLoading(false)
      inFlightRef.current = false
    }
  }

  useEffect(() => {
    void fetchProducts(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { loading, error, refresh: () => fetchProducts(true) }
}
