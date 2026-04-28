import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingBag, LogOut, User as UserIcon, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useCartStore } from '@/stores/cartStore'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from './ThemeToggle'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { cn } from '@/lib/cn'

const sections = [
  { to: '/products', label: 'Novidades' },
  { to: '/products?section=collections', label: 'Coleções' },
  { to: '/products?section=boutique', label: 'Boutique' },
  { to: '/products?section=editorial', label: 'Editorial' },
]

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const totalItems = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0))
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  // Detail page mostra "Coleções" ativo (per Figma); catalog mostra "Novidades" ativo
  const isDetailPage = location.pathname.startsWith('/products/')

  const navLinkClass = ({ isActive }: { isActive: boolean }) => {
    const fakeActive = isDetailPage
      ? sections.findIndex((s) => s.to === '/products?section=collections') >= 0
      : false
    return cn(
      'relative px-0 pb-1.5 text-sm tracking-[0.35px] transition-colors',
      isActive || fakeActive
        ? 'text-[#a78bfa] border-b-2 border-[#7c3aed]'
        : 'text-[#94a3b8] hover:text-white',
    )
  }

  return (
    <>
      <header
        className="sticky top-0 z-30 h-20 border-b border-white/10 bg-[rgba(2,6,23,0.8)] backdrop-blur-[12px]"
        style={{ boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.4)' }}
      >
        <div className="mx-auto flex h-full max-w-[1536px] items-center justify-between px-8">
          <Link to="/products" className="font-black uppercase tracking-[-1.2px] text-2xl text-white">
            NOIR LUXE
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {sections.map((s, i) => (
              <NavLink
                key={s.label}
                to={s.to}
                end={i === 0}
                className={navLinkClass}
              >
                {s.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Abrir carrinho (${totalItems} itens)`}
              className="relative grid place-items-center text-white hover:opacity-80"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1.5 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#7c3aed] px-1 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>

            <ThemeToggle />

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
              <div className="mt-6 flex flex-col gap-2">
                {sections.map((s) => (
                  <NavLink
                    key={s.label}
                    to={s.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'rounded-md px-3 py-2 text-sm',
                        isActive ? 'text-[#a78bfa]' : 'text-[#94a3b8] hover:text-white',
                      )
                    }
                  >
                    {s.label}
                  </NavLink>
                ))}
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
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
