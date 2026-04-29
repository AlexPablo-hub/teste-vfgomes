import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingBag, LogOut, User as UserIcon, Menu, X, Heart } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useCartStore } from '@/stores/cartStore'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { Button } from '@/components/ui/Button'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { FavoritesDrawer } from '@/components/favorites/FavoritesDrawer'
import { slideDown } from '@/lib/motion'

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Páginas que usam header minimal — apenas wordmark NOIR LUXE centralizado,
  // sem botões de carrinho/favoritos/usuário. Útil em rotas de "estado final"
  // como o comprovante de pedido, onde o usuário não deve ser tentado a sair.
  const isMinimalRoute = location.pathname === '/checkout/sucesso'
  // Contagem = produtos distintos no carrinho (não soma de quantidades).
  // Mudar a quantidade de um item já no carrinho NÃO incrementa esse badge —
  // só adicionar um produto novo distinto faz subir.
  const distinctCartItems = useCartStore((s) => s.items.length)
  const favoritesCount = useFavoritesStore((s) => s.items.length)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [favoritesOpen, setFavoritesOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  if (isMinimalRoute) {
    return (
      <motion.header
        variants={slideDown}
        initial="hidden"
        animate="visible"
        className="sticky top-0 z-30 h-20 border-b border-white/10 bg-[rgba(2,6,23,0.8)] backdrop-blur-[12px] print:hidden"
      >
        <div className="mx-auto flex h-full max-w-[1536px] items-center justify-center px-8">
          <Link
            to="/products"
            className="brand-wordmark font-black uppercase tracking-[-1.2px] text-2xl text-white"
            aria-label="Voltar para a loja"
          >
            NOIR LUXE
          </Link>
        </div>
      </motion.header>
    )
  }

  return (
    <>
      <motion.header
        variants={slideDown}
        initial="hidden"
        animate="visible"
        className="sticky top-0 z-30 h-20 border-b border-white/10 bg-[rgba(2,6,23,0.8)] backdrop-blur-[12px]"
        style={{ boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.4)' }}
      >
        <div className="mx-auto flex h-full max-w-[1536px] items-center justify-between px-8">
          <Link to="/products" className="font-black uppercase tracking-[-1.2px] text-2xl text-white">
            NOIR LUXE
          </Link>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Abrir carrinho (${distinctCartItems} ${distinctCartItems === 1 ? 'produto' : 'produtos'})`}
              className="relative grid place-items-center text-white hover:opacity-80"
            >
              <ShoppingBag className="h-5 w-5" />
              {distinctCartItems > 0 && (
                <span className="absolute -right-1.5 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#7c3aed] px-1 text-[10px] font-bold text-white">
                  {distinctCartItems}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setFavoritesOpen(true)}
              aria-label={`Abrir favoritos (${favoritesCount} ${favoritesCount === 1 ? 'item' : 'itens'})`}
              className="relative grid place-items-center text-white hover:opacity-80"
            >
              <Heart className="h-5 w-5" />
              {favoritesCount > 0 && (
                <span className="absolute -right-1.5 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#7c3aed] px-1 text-[10px] font-bold text-white">
                  {favoritesCount}
                </span>
              )}
            </button>

            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="grid place-items-center text-white hover:opacity-80"
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                aria-label="Abrir menu do usuário"
              >
                <UserIcon className="h-4 w-4" />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} aria-hidden />
                  <div
                    role="menu"
                    className="absolute right-0 z-20 mt-3 w-56 origin-top-right rounded-lg border border-white/10 bg-[rgba(15,23,42,0.95)] p-2 shadow-xl backdrop-blur-md animate-scale-in"
                  >
                    <div className="border-b border-white/5 px-3 py-2">
                      <div className="text-sm font-medium text-white">
                        {user?.name.firstname} {user?.name.lastname}
                      </div>
                      <div className="text-xs text-[#94a3b8]">{user?.email}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[#f87171] hover:bg-white/5"
                      role="menuitem"
                    >
                      <LogOut className="h-4 w-4" /> Sair
                    </button>
                  </div>
                </>
              )}
            </div>

            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {menuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} aria-hidden />
            <div className="absolute right-0 top-0 h-full w-72 max-w-[80%] bg-[#020617] p-4 shadow-xl animate-slide-in-right">
              <div className="flex items-center justify-between">
                <span className="font-black uppercase tracking-[-0.5px] text-base text-white">NOIR LUXE</span>
                <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)} aria-label="Fechar menu">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="mt-6 border-t border-white/10 pt-4">
                <div className="px-3 text-sm">
                  <div className="font-medium text-white">
                    {user?.name.firstname} {user?.name.lastname}
                  </div>
                  <div className="text-xs text-[#94a3b8]">{user?.email}</div>
                </div>
                <Button variant="ghost" className="mt-3 w-full justify-start text-[#f87171]" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" /> Sair
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <FavoritesDrawer open={favoritesOpen} onClose={() => setFavoritesOpen(false)} />
    </>
  )
}
