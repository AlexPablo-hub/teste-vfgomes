const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatBRL(value: number): string {
  return BRL.format(value)
}

/**
 * Máscara progressiva para input de moeda BRL. Cada dígito digitado conta
 * como centavo — convenção comum em forms BR para evitar ambiguidade de
 * onde fica a vírgula. Idempotente.
 *
 *   maskBRL('1')         // 'R$ 0,01'
 *   maskBRL('150')       // 'R$ 1,50'
 *   maskBRL('150000')    // 'R$ 1.500,00'
 *   maskBRL('R$ 15,00')  // 'R$ 15,00' (idempotente)
 */
export function maskBRL(value: string | null | undefined): string {
  if (!value) return ''
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return BRL.format(Number(digits) / 100)
}

/** Extrai o número decimal de uma string mascarada por maskBRL. */
export function parseBRL(value: string | null | undefined): number {
  if (!value) return 0
  const digits = value.replace(/\D/g, '')
  if (!digits) return 0
  return Number(digits) / 100
}

/**
 * Valida formato básico de e-mail: <local>@<domínio>.<tld>.
 * Trim aplicado pra tolerar espaços acidentais na borda.
 *
 *   isValidEmail('a@b.co')         // true
 *   isValidEmail('a@b')            // false (sem TLD)
 *   isValidEmail('semarroba.com')  // false
 *   isValidEmail('')               // false
 */
export function isValidEmail(value: string | null | undefined): boolean {
  if (!value) return false
  return /^\S+@\S+\.\S+$/.test(value.trim())
}

/**
 * Formata um número de telefone para o padrão brasileiro: +55 XX XXXXX-XXXX.
 *
 * Aceita várias entradas (com/sem máscara, com/sem country code US) e
 * sempre devolve o formato BR. Idempotente: aplicar na saída anterior
 * produz o mesmo resultado.
 *
 * Regras:
 *  - 11 dígitos começando com 1 → assume country code US, descarta o '1'.
 *  - 11 dígitos sem prefixo → BR celular (DDD + 9 dígitos).
 *  - 10 dígitos → BR fixo (DDD + 8 dígitos).
 *  - Outros tamanhos → devolve o input original (não corrompe).
 *
 * @example
 *   formatPhoneBR('1-570-236-7033')  // '+55 57 0236-7033'
 *   formatPhoneBR('11987654321')     // '+55 11 98765-4321'
 *   formatPhoneBR('1187654321')      // '+55 11 8765-4321'
 *   formatPhoneBR('+55 11 98765-4321') // '+55 11 98765-4321' (idempotente)
 */
export function formatPhoneBR(value: string | null | undefined): string {
  if (!value) return ''
  const trimmed = value.trim()
  // Detecta padrão US "1-XXX-XXX-XXXX" pela ESTRUTURA original (não só pelo
  // tamanho), pra não confundir com DDD 11 que também tem 11 dígitos no total.
  const isUSFormat = /^\+?1[-\s.]\d{3}[-\s.]\d{3}[-\s.]\d{4}$/.test(trimmed)
  // Descarta o prefixo '+55' explícito antes de extrair dígitos, senão a
  // entrada já mascarada ('+55 11 98765-4321') somaria '55' ao DDD.
  const withoutBR = trimmed.startsWith('+55') ? trimmed.slice(3) : trimmed
  let digits = withoutBR.replace(/\D/g, '')

  if (isUSFormat && digits.length === 11) {
    digits = digits.slice(1) // descarta country code US
  }

  if (digits.length === 11) {
    // BR celular: +55 XX XXXXX-XXXX
    return `+55 ${digits.slice(0, 2)} ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    // BR fixo (ou US sem country code): +55 XX XXXX-XXXX
    return `+55 ${digits.slice(0, 2)} ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  // Tamanho fora do esperado: devolve original sem corromper
  return value
}

/**
 * Formata um CEP brasileiro no padrão XX.XXX-XXX (8 dígitos).
 *
 * Aceita entrada com ou sem máscara. Se houver mais de 8 dígitos
 * (ex: ZIP+4 americano '12926-3874' = 9), descarta o excesso.
 *
 * Idempotente: aplicar na saída produz o mesmo resultado.
 *
 * @example
 *   formatCEP('12345678')   // '12.345-678'
 *   formatCEP('12345-678')  // '12.345-678'
 *   formatCEP('12926-3874') // '12.926-387' (ignora 9º dígito)
 *   formatCEP('123')        // '123' (incompleto, devolve original)
 */
export function formatCEP(value: string | null | undefined): string {
  if (!value) return ''
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length < 8) return value
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}-${digits.slice(5)}`
}

/**
 * Versão "máscara progressiva" para usar enquanto o usuário digita o CEP.
 * Diferente de formatCEP, aceita entradas parciais e formata o que tem:
 *
 *   '12'        → '12'
 *   '123'       → '12.3'
 *   '12345'     → '12.345'
 *   '123456'    → '12.345-6'
 *   '12345678'  → '12.345-678'
 */
export function maskCEP(value: string | null | undefined): string {
  if (!value) return ''
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}-${digits.slice(5)}`
}

/**
 * Versão "máscara progressiva" para uso enquanto o usuário digita o telefone.
 * Mantém o usuário em formato BR válido durante a digitação.
 *
 *   '1'           → '+55 1'
 *   '11'          → '+55 11'
 *   '1198'        → '+55 11 98'
 *   '11987654'    → '+55 11 98765-4'
 *   '11987654321' → '+55 11 98765-4321'
 */
export function maskPhoneBR(value: string | null | undefined): string {
  if (!value) return ''
  const trimmed = value.trim()
  // Detecta paste de número US (estrutura "1-XXX-XXX-XXXX") e descarta o '1'.
  // Caso contrário, trata como BR e preserva todos os dígitos digitados.
  const isUSFormat = /^\+?1[-\s.]\d{3}[-\s.]\d{3}[-\s.]\d{4}$/.test(trimmed)
  // Descarta o prefixo '+55' que a própria máscara reinjeta no input — sem
  // isso, ao digitar '5' o valor vira '+55 5', volta no onChange como '+55 55'
  // e os '55' do prefixo passariam a contar como DDD.
  const withoutBR = trimmed.startsWith('+55') ? trimmed.slice(3) : trimmed
  let digits = withoutBR.replace(/\D/g, '')
  if (isUSFormat && digits.length === 11) {
    digits = digits.slice(1)
  }
  // Limita a 11 dígitos (DDD 2 + celular 9)
  digits = digits.slice(0, 11)

  if (digits.length === 0) return ''
  if (digits.length <= 2) return `+55 ${digits}`
  if (digits.length <= 6) return `+55 ${digits.slice(0, 2)} ${digits.slice(2)}`
  if (digits.length <= 10) {
    // Fixo: XXXX-XXXX
    return `+55 ${digits.slice(0, 2)} ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  // Celular: XXXXX-XXXX
  return `+55 ${digits.slice(0, 2)} ${digits.slice(2, 7)}-${digits.slice(7)}`
}
