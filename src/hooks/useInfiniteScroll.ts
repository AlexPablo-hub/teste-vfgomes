import { useEffect, useRef } from 'react'

/**
 * Hook de rolagem infinita via IntersectionObserver. Retorna uma ref que
 * deve ser anexada a um elemento "sentinel" no final da lista. Quando o
 * sentinel entra na viewport, dispara `onLoadMore` (com margem antecipada
 * de 200px pra começar a carregar antes do usuário chegar no fim).
 *
 * @param onLoadMore Callback disparado ao atingir o fim. Use-o para
 *   incrementar o `visibleCount` ou buscar a próxima página.
 * @param hasMore Quando false, o observer é desconectado — evita loops
 *   infinitos depois que tudo já foi exibido.
 */
export function useInfiniteScroll<T extends HTMLElement = HTMLDivElement>(
  onLoadMore: () => void,
  hasMore: boolean,
) {
  const sentinelRef = useRef<T>(null)
  // Refs evitam recriar o observer a cada render quando o callback muda.
  const callbackRef = useRef(onLoadMore)
  callbackRef.current = onLoadMore

  useEffect(() => {
    if (!hasMore) return
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) callbackRef.current()
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore])

  return sentinelRef
}
