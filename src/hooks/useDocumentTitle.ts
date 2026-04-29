import { useEffect } from 'react'

/**
 * Atualiza o título da aba do navegador (document.title) enquanto o
 * componente estiver montado. Restaura o título anterior quando o
 * componente desmonta — evita "vazamento" entre rotas.
 *
 * Reativo: se `title` mudar (ex: depende de state como tab selecionada),
 * o useEffect re-executa e atualiza.
 *
 * @example
 *   useDocumentTitle('Admin - Estoque')                  // estático
 *   useDocumentTitle(`Login - ${tab === 'admin' ? 'Administrador' : 'Cliente'}`)  // reativo
 */
export function useDocumentTitle(title: string | null | undefined): void {
  useEffect(() => {
    if (!title) return
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  }, [title])
}
