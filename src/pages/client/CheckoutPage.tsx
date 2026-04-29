import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { CreditCard, MapPin, User as UserIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCartStore } from '@/stores/cartStore'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { CartSummary } from '@/components/cart/CartSummary'
import { maskCEP, isValidEmail } from '@/lib/format'
import { toast } from '@/lib/toast'
import { fadeIn, slideUp, staggerContainer, staggerItem } from '@/lib/motion'

type PaymentMethod = 'pix' | 'boleto'

interface FieldErrors {
  name?: string
  email?: string
  zipcode?: string
  street?: string
  number?: string
  city?: string
}

function formatOrderId(): string {
  const seq = Math.floor(10000 + Math.random() * 90000)
  return `#NL-${seq}-${new Date().getFullYear()}`
}

function formatEta(): string {
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]}, ${d.getFullYear()}`
}

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const subtotal = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0)
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0)
  const clear = useCartStore((s) => s.clear)
  const { user } = useAuth()
  const navigate = useNavigate()

  const [submitting, setSubmitting] = useState(false)
  // Trava a guarda de "carrinho vazio" durante o submit. Sem isso, o `clear()`
  // zera o cart antes do `navigate('/checkout/sucesso')` ser processado, o
  // re-render dispara <Navigate to="/products"> e o usuário acaba na loja.
  const [finalizing, setFinalizing] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  const [name, setName] = useState(user ? `${user.name.firstname} ${user.name.lastname}` : '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [zipcode, setZipcode] = useState(user?.address.zipcode ?? '')
  const [street, setStreet] = useState(user?.address.street ?? '')
  const [number, setNumber] = useState(String(user?.address.number ?? ''))
  const [city, setCity] = useState(user?.address.city ?? '')
  const [payment, setPayment] = useState<PaymentMethod>('pix')

  if (items.length === 0 && !finalizing) {
    return <Navigate to="/products" replace />
  }

  /** Helper pra limpar erro de um campo conforme o usuário digita. */
  const clearFieldError = (field: keyof FieldErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const validate = (): FieldErrors => {
    const errs: FieldErrors = {}
    if (name.trim().length < 3) errs.name = 'Informe seu nome completo.'
    if (!isValidEmail(email)) errs.email = 'E-mail inválido (ex: nome@dominio.com).'
    if (zipcode.replace(/\D/g, '').length !== 8) errs.zipcode = 'CEP precisa ter 8 dígitos.'
    if (!street.trim()) errs.street = 'Informe a rua.'
    if (!number.trim()) errs.number = 'Informe o número.'
    if (!city.trim()) errs.city = 'Informe a cidade.'
    return errs
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error('Verifique os dados antes de confirmar o pedido.')
      return
    }
    setErrors({})
    setSubmitting(true)
    setFinalizing(true)
    await new Promise((r) => setTimeout(r, 800))
    // Mesma fórmula do CartSummary — sem isso o resumo do checkout mostrava
    // R$ 19,90 e a página de sucesso aparecia como "Grátis", confundindo o usuário.
    const shipping = subtotal > 200 ? 0 : 19.9
    const orderState = {
      orderId: formatOrderId(),
      estimatedDelivery: formatEta(),
      items: [...items],
      subtotal,
      shipping,
      total: subtotal + shipping,
    }
    clear()
    // Persiste em sessionStorage também, pra sobreviver a F5 na página de
    // sucesso (location.state é volátil entre reloads).
    try {
      sessionStorage.setItem('last-order', JSON.stringify(orderState))
    } catch {
      // sessionStorage indisponível (modo privado, etc) — não é crítico.
    }
    navigate('/checkout/sucesso', { state: orderState, replace: true })
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <motion.div variants={slideUp} initial="hidden" animate="visible">
        <h1 className="text-3xl font-bold tracking-tight">Finalizar compra</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Revise seus dados e confirme o pedido.
        </p>
      </motion.div>

      <motion.form
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit}
        className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]"
        noValidate
      >
        <div className="flex flex-col gap-6">
          <motion.section
            variants={staggerItem}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5"
          >
            <header className="mb-4 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-[var(--color-primary)]" />
              <h2 className="font-semibold">Dados pessoais</h2>
            </header>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Nome completo"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  clearFieldError('name')
                }}
                error={errors.name}
                required
                autoComplete="name"
              />
              <Input
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  clearFieldError('email')
                }}
                error={errors.email}
                placeholder="ex: nome@dominio.com"
                required
                autoComplete="email"
              />
            </div>
          </motion.section>

          <motion.section
            variants={staggerItem}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5"
          >
            <header className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[var(--color-primary)]" />
              <h2 className="font-semibold">Endereço de entrega</h2>
            </header>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <Input
                label="CEP"
                value={maskCEP(zipcode)}
                onChange={(e) => {
                  setZipcode(maskCEP(e.target.value))
                  clearFieldError('zipcode')
                }}
                error={errors.zipcode}
                placeholder="ex: 12.345-678"
                required
                autoComplete="postal-code"
                inputMode="numeric"
                containerClassName="sm:col-span-2"
              />
              <Input
                label="Rua"
                value={street}
                onChange={(e) => {
                  setStreet(e.target.value)
                  clearFieldError('street')
                }}
                error={errors.street}
                required
                autoComplete="street-address"
                containerClassName="sm:col-span-3"
              />
              <Input
                label="Número"
                value={number}
                onChange={(e) => {
                  // Aceita apenas dígitos pra evitar texto no número.
                  setNumber(e.target.value.replace(/\D/g, ''))
                  clearFieldError('number')
                }}
                error={errors.number}
                required
                inputMode="numeric"
                containerClassName="sm:col-span-1"
              />
              <Input
                label="Cidade"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value)
                  clearFieldError('city')
                }}
                error={errors.city}
                required
                autoComplete="address-level2"
                containerClassName="sm:col-span-6"
              />
            </div>
          </motion.section>

          <motion.section
            variants={staggerItem}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5"
          >
            <header className="mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[var(--color-primary)]" />
              <h2 className="font-semibold">Pagamento</h2>
            </header>
            <Select
              label="Método"
              value={payment}
              onChange={(e) => setPayment(e.target.value as PaymentMethod)}
            >
              <option value="pix">Pix</option>
              <option value="boleto">Boleto</option>
            </Select>
            {payment === 'pix' && (
              <p className="mt-3 rounded-lg bg-[var(--color-muted)]/60 p-3 text-sm animate-fade-in">
                Após confirmar o pedido, você verá o QR code para pagamento. (mock)
              </p>
            )}
            {payment === 'boleto' && (
              <p className="mt-3 rounded-lg bg-[var(--color-muted)]/60 p-3 text-sm animate-fade-in">
                O boleto será gerado e enviado para o e-mail informado. (mock)
              </p>
            )}
          </motion.section>
        </div>

        <motion.div
          variants={staggerItem}
          className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start"
        >
          <CartSummary subtotal={subtotal} itemCount={totalItems} hideCta />
          <Button type="submit" loading={submitting} size="lg" className="w-full">
            {submitting ? 'Processando…' : 'Confirmar pedido'}
          </Button>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Compra simulada — nenhum valor será cobrado.
          </p>
        </motion.div>
      </motion.form>
    </motion.div>
  )
}
