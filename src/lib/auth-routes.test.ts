import { describe, it, expect } from 'vitest'
import { isAdminPath, resolveTarget, ROLE_HOME } from './auth-routes'

describe('auth-routes', () => {
  describe('ROLE_HOME', () => {
    it('mapeia admin para /admin/estoque', () => {
      expect(ROLE_HOME.admin).toBe('/admin/estoque')
    })
    it('mapeia client para /products', () => {
      expect(ROLE_HOME.client).toBe('/products')
    })
  })

  describe('isAdminPath', () => {
    it('reconhece rotas /admin/*', () => {
      expect(isAdminPath('/admin')).toBe(true)
      expect(isAdminPath('/admin/estoque')).toBe(true)
      expect(isAdminPath('/admin/clientes')).toBe(true)
    })
    it('rejeita rotas não-admin', () => {
      expect(isAdminPath('/products')).toBe(false)
      expect(isAdminPath('/checkout')).toBe(false)
      expect(isAdminPath('/')).toBe(false)
    })
  })

  describe('resolveTarget — segurança contra escalonamento de privilégio', () => {
    it('sem from: usa o home da role', () => {
      expect(resolveTarget('admin')).toBe('/admin/estoque')
      expect(resolveTarget('client')).toBe('/products')
      expect(resolveTarget('admin', null)).toBe('/admin/estoque')
      expect(resolveTarget('client', undefined)).toBe('/products')
    })

    it('cliente NÃO é levado para /admin/* mesmo se from apontar pra lá', () => {
      // Caso de regressão do bug reportado: usuário deslogado tenta acessar
      // /admin/estoque, RequireAuth seta from='/admin/estoque', cliente loga
      // — não pode entrar em admin.
      expect(resolveTarget('client', '/admin/estoque')).toBe('/products')
      expect(resolveTarget('client', '/admin/clientes')).toBe('/products')
      expect(resolveTarget('client', '/admin')).toBe('/products')
    })

    it('admin NÃO é levado para rotas de cliente mesmo se from apontar pra lá', () => {
      // RequireAuth role="client" recusaria admin de qualquer forma — mas
      // defendemos em profundidade aqui também.
      expect(resolveTarget('admin', '/products')).toBe('/admin/estoque')
      expect(resolveTarget('admin', '/checkout')).toBe('/admin/estoque')
    })

    it('respeita from quando bate com a role', () => {
      // Cliente tentou /products/5 antes de logar → vai pra lá após login
      expect(resolveTarget('client', '/products/5')).toBe('/products/5')
      expect(resolveTarget('client', '/checkout')).toBe('/checkout')
      // Admin tentou /admin/clientes antes de logar → vai pra lá
      expect(resolveTarget('admin', '/admin/clientes')).toBe('/admin/clientes')
    })
  })
})
