import { useEffect } from 'react'
import { useProductsStore } from '@/stores/productsStore'
import { useUsersStore } from '@/stores/usersStore'
import { useCartStore } from '@/stores/cartStore'
import { useFavoritesStore } from '@/stores/favoritesStore'

/**
 * Sincroniza stores Zustand persist entre abas do mesmo navegador.
 *
 * Sem isso, o admin que cria um produto na aba A não veria o produto refletido
 * na loja aberta na aba B até que B fizesse F5 — porque cada aba mantém uma
 * cópia em memória do store, e localStorage só é lido na primeira hidratação.
 *
 * Estratégia: ouvimos o evento `storage` (disparado pelo browser na ABA B
 * quando A escreve no localStorage). Quando a chave persistida muda, chamamos
 * `persist.rehydrate()` no store correspondente, que relê do localStorage e
 * dispara re-render dos componentes inscritos.
 */
export function useCrossTabSync() {
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      // Outras abas escrevendo, não nós mesmos. e.key === null acontece em
      // localStorage.clear() — não nos interessa aqui.
      if (!e.key) return
      switch (e.key) {
        case 'fakestore-products':
          void useProductsStore.persist.rehydrate()
          break
        case 'fakestore-users':
          void useUsersStore.persist.rehydrate()
          break
        case 'fakestore-cart':
          void useCartStore.persist.rehydrate()
          break
        case 'fakestore-favorites':
          void useFavoritesStore.persist.rehydrate()
          break
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])
}
