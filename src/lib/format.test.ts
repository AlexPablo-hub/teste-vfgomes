import { describe, it, expect } from 'vitest'
import {
  formatBRL,
  formatPhoneBR,
  formatCEP,
  maskCEP,
  maskPhoneBR,
  maskBRL,
  parseBRL,
  isValidEmail,
} from './format'

describe('formatBRL', () => {
  it('formata número como moeda BRL', () => {
    expect(formatBRL(1234.5)).toMatch(/R\$\s*1\.234,50/)
    expect(formatBRL(0)).toMatch(/R\$\s*0,00/)
  })
})

describe('formatPhoneBR', () => {
  it('formata telefone US (Fakestore) para padrão BR', () => {
    expect(formatPhoneBR('1-570-236-7033')).toBe('+55 57 0236-7033')
    expect(formatPhoneBR('1-678-456-1934')).toBe('+55 67 8456-1934')
  })

  it('formata 11 dígitos como celular BR', () => {
    expect(formatPhoneBR('11987654321')).toBe('+55 11 98765-4321')
    expect(formatPhoneBR('66996224327')).toBe('+55 66 99622-4327')
  })

  it('formata 10 dígitos como fixo BR', () => {
    expect(formatPhoneBR('1187654321')).toBe('+55 11 8765-4321')
  })

  it('é idempotente — aplicar duas vezes não corrompe', () => {
    const formatted = formatPhoneBR('66996224327')
    expect(formatPhoneBR(formatted)).toBe(formatted)
  })

  it('retorna string vazia para null/undefined/empty', () => {
    expect(formatPhoneBR(null)).toBe('')
    expect(formatPhoneBR(undefined)).toBe('')
    expect(formatPhoneBR('')).toBe('')
  })

  it('devolve input original se tamanho fora do esperado', () => {
    expect(formatPhoneBR('123')).toBe('123')
    expect(formatPhoneBR('abc')).toBe('abc')
  })

  it('lida com entrada já mascarada', () => {
    expect(formatPhoneBR('(11) 98765-4321')).toBe('+55 11 98765-4321')
  })
})

describe('formatCEP', () => {
  it('formata 8 dígitos como XX.XXX-XXX', () => {
    expect(formatCEP('12345678')).toBe('12.345-678')
    expect(formatCEP('78554232')).toBe('78.554-232')
  })

  it('aceita CEP já com hífen', () => {
    expect(formatCEP('12345-678')).toBe('12.345-678')
  })

  it('descarta dígitos extras (ZIP+4 americano)', () => {
    expect(formatCEP('12926-3874')).toBe('12.926-387')
  })

  it('é idempotente', () => {
    expect(formatCEP('12.345-678')).toBe('12.345-678')
  })

  it('retorna string vazia para null/undefined/empty', () => {
    expect(formatCEP(null)).toBe('')
    expect(formatCEP(undefined)).toBe('')
  })

  it('devolve input se incompleto (< 8 dígitos)', () => {
    expect(formatCEP('123')).toBe('123')
  })
})

describe('maskCEP — máscara progressiva durante digitação', () => {
  it('formata progressivamente conforme dígitos chegam', () => {
    expect(maskCEP('1')).toBe('1')
    expect(maskCEP('12')).toBe('12')
    expect(maskCEP('123')).toBe('12.3')
    expect(maskCEP('12345')).toBe('12.345')
    expect(maskCEP('123456')).toBe('12.345-6')
    expect(maskCEP('12345678')).toBe('12.345-678')
  })

  it('descarta dígitos além de 8', () => {
    expect(maskCEP('123456789')).toBe('12.345-678')
  })

  it('ignora caracteres não-numéricos', () => {
    expect(maskCEP('12abc345')).toBe('12.345')
  })
})

describe('maskPhoneBR — máscara progressiva durante digitação', () => {
  it('formata progressivamente do DDI até celular completo', () => {
    expect(maskPhoneBR('1')).toBe('+55 1')
    expect(maskPhoneBR('11')).toBe('+55 11')
    expect(maskPhoneBR('1198')).toBe('+55 11 98')
    expect(maskPhoneBR('1198765')).toBe('+55 11 9876-5')
    expect(maskPhoneBR('11987654321')).toBe('+55 11 98765-4321')
  })

  it('limita a 11 dígitos (descartando excesso)', () => {
    expect(maskPhoneBR('11987654321999')).toBe('+55 11 98765-4321')
  })

  it('remove country code US se colado da API com estrutura US', () => {
    // Estrutura US explícita ("1-XXX-XXX-XXXX") sinaliza pra remover o country code
    expect(maskPhoneBR('1-570-236-7033')).toBe('+55 57 0236-7033')
  })

  it('trata 11 dígitos puros como BR (sem assumir US)', () => {
    // "11987654321" é DDD 11 (SP) + celular — não confundir com US "1-XXX-..."
    expect(maskPhoneBR('11987654321')).toBe('+55 11 98765-4321')
  })

  it('retorna vazio se input vazio', () => {
    expect(maskPhoneBR('')).toBe('')
    expect(maskPhoneBR(null)).toBe('')
  })

  it('não retroalimenta o prefixo +55 a cada digitação', () => {
    // Simula o usuário digitando '5' duas vezes em um <input>:
    // 1ª digitação: '5' → '+55 5' (input recebe esse value)
    // 2ª digitação: '+55 55' → deve resultar '+55 55' (DDD), não '+55 55 5'
    expect(maskPhoneBR('5')).toBe('+55 5')
    expect(maskPhoneBR('+55 55')).toBe('+55 55')
    expect(maskPhoneBR('+55 555')).toBe('+55 55 5')
  })

  it('é idempotente — aplicar na saída anterior não corrompe', () => {
    const out = maskPhoneBR('11987654321')
    expect(maskPhoneBR(out)).toBe(out)
  })
})

describe('maskBRL — máscara progressiva de moeda', () => {
  it('formata dígitos como centavos crescendo', () => {
    expect(maskBRL('1')).toMatch(/R\$\s*0,01/)
    expect(maskBRL('150')).toMatch(/R\$\s*1,50/)
    expect(maskBRL('150000')).toMatch(/R\$\s*1\.500,00/)
  })

  it('é idempotente — aplicar na saída anterior não corrompe', () => {
    const out = maskBRL('150000')
    expect(maskBRL(out)).toBe(out)
  })

  it('retorna vazio para entrada vazia ou só não-dígitos', () => {
    expect(maskBRL('')).toBe('')
    expect(maskBRL(null)).toBe('')
    expect(maskBRL('R$ ,')).toBe('')
  })
})

describe('parseBRL — extrai número da string mascarada', () => {
  it('devolve decimal com centavos', () => {
    expect(parseBRL('R$ 1.500,00')).toBe(1500)
    expect(parseBRL('R$ 1,50')).toBe(1.5)
    expect(parseBRL('R$ 0,01')).toBe(0.01)
  })

  it('devolve 0 para vazio', () => {
    expect(parseBRL('')).toBe(0)
    expect(parseBRL(null)).toBe(0)
  })
})

describe('isValidEmail', () => {
  it('aceita e-mails bem formados', () => {
    expect(isValidEmail('a@b.co')).toBe(true)
    expect(isValidEmail('nome.sobrenome@dominio.com.br')).toBe(true)
    expect(isValidEmail('  com.espaco@x.io  ')).toBe(true)
  })

  it('rejeita strings sem @', () => {
    expect(isValidEmail('semarroba.com')).toBe(false)
    expect(isValidEmail('nome')).toBe(false)
  })

  it('rejeita strings sem domínio com TLD', () => {
    expect(isValidEmail('a@b')).toBe(false)
    expect(isValidEmail('a@')).toBe(false)
  })

  it('rejeita null/undefined/empty', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail(null)).toBe(false)
    expect(isValidEmail(undefined)).toBe(false)
  })
})
