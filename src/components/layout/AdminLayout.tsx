import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Users as UsersIcon,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { slideInLeft, slideDown } from '@/lib/motion'

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  matchPaths?: string[]
}

const navItems: NavItem[] = [
  { to: '/admin/painel', label: 'PAINEL', icon: LayoutDashboard },
  {
    to: '/admin/estoque',
    label: 'ESTOQUE',
    icon: Package,
    matchPaths: ['/admin/estoque', '/admin/products'],
  },
  {
    to: '/admin/clientes',
    label: 'CLIENTES',
    icon: UsersIcon,
    matchPaths: ['/admin/clientes', '/admin/users'],
  },
]

const breadcrumbLabels: Record<string, string> = {
  admin: 'Admin',
  estoque: 'estoque',
  products: 'estoque',
  clientes: 'clientes',
  users: 'clientes',
  painel: 'painel',
}

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const segments = location.pathname.split('/').filter(Boolean)

  const sidebarContent = (
    <div className="flex h-full flex-col py-8">
      {/* Brand */}
      <div className="px-6 pb-10">
        <h1 className="text-lg font-bold uppercase tracking-[1.8px] leading-7 text-white">ADMIN</h1>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon, matchPaths }) => {
          const isActive = matchPaths
            ? matchPaths.some((p) => location.pathname.startsWith(p))
            : location.pathname === to
          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-xs font-medium uppercase tracking-[1.2px] leading-4 transition-all',
                isActive
                  ? 'border-l-4 border-[#7c3aed] bg-[rgba(124,58,237,0.2)] pl-5 text-[#a78bfa]'
                  : 'text-[#64748b] hover:bg-white/5 hover:text-white',
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span>{label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 pt-6">
        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-3 text-xs font-medium uppercase tracking-[1.2px] leading-4 text-[#64748b] hover:bg-white/5 hover:text-white"
        >
          <Settings className="h-5 w-5" />
          SETTINGS
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 text-xs font-medium uppercase tracking-[1.2px] leading-4 text-[#64748b] hover:bg-white/5 hover:text-[#f87171]"
        >
          <LogOut className="h-[18px] w-[18px]" />
          SIGN OUT
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#0c1324]">
      {/* Sidebar desktop */}
      <motion.aside
        variants={slideInLeft}
        initial="hidden"
        animate="visible"
        className="hidden w-64 shrink-0 border-r border-white/10 bg-[rgba(15,23,42,0.9)] backdrop-blur-[8px] lg:block"
        style={{ boxShadow: '4px 0px 24px 0px rgba(0,0,0,0.5)' }}
      >
        {sidebarContent}
      </motion.aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} aria-hidden />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-white/10 bg-[rgba(15,23,42,0.95)] backdrop-blur-[8px] animate-slide-in-right">
            <div className="absolute right-2 top-3">
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
                <X className="h-5 w-5 text-white" />
              </Button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Conteúdo */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top header com breadcrumb + profile */}
        <motion.header
          variants={slideDown}
          initial="hidden"
          animate="visible"
          className="sticky top-0 z-20 flex h-12 items-center justify-between gap-3 border-b border-white/10 bg-[rgba(2,6,23,0.8)] px-8 backdrop-blur-[12px]"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5 text-white" />
            </Button>
            <nav aria-label="Breadcrumb" className="flex items-center gap-3">
              {segments.map((seg, i) => {
                const isLast = i === segments.length - 1
                const path = '/' + segments.slice(0, i + 1).join('/')
                const label = breadcrumbLabels[seg] ?? seg
                return (
                  <span key={path} className="flex items-center gap-3">
                    {i > 0 && <ChevronRight className="h-3.5 w-4 text-[#475569]" />}
                    {isLast ? (
                      <span className="text-sm font-semibold tracking-[0.28px] text-white">
                        {label}
                      </span>
                    ) : (
                      <Link
                        to={path}
                        className="text-sm font-medium tracking-[0.28px] text-[#94a3b8] hover:text-white"
                      >
                        {label}
                      </Link>
                    )}
                  </span>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 py-1.5 pl-2.5 pr-4">
              <span
                aria-hidden
                className="h-8 w-8 rounded-full bg-cover bg-center"
                style={{ backgroundImage: "url('/images/admin-avatar.jpg')" }}
              />
              <span className="text-sm font-semibold tracking-[0.28px] text-white">
                {user?.name.firstname} {user?.name.lastname}
              </span>
            </div>
          </div>
        </motion.header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="border-t border-white/5 bg-[#020617] px-8 py-12">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-xs leading-4 text-[#64748b]">
              © {new Date().getFullYear()} NOIR_LUXE. All rights reserved.
            </p>
            <ul className="flex gap-x-8">
              <li>
                <a href="#" className="text-xs text-[#475569] hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-xs text-[#475569] hover:text-white">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-xs text-[#475569] hover:text-white">
                  Shipping
                </a>
              </li>
              <li>
                <a href="#" className="text-xs text-[#475569] hover:text-white">
                  Returns
                </a>
              </li>
            </ul>
          </div>
        </footer>
      </div>
    </div>
  )
}
