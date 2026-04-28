import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { CreditCard, MapPin, User as UserIcon } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { CartSummary } from '@/components/cart/CartSummary'

type PaymentMethod = 'credit' | 'pix' | 'boleto'

function formatOrderId(): string {
  const seq = Math.floor(10000 + Math.random() * 90000)
  return `#NL-${seq}-${new Date().getFullYear()}`
}

function formatEta(): string {
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
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

  const [name, setName] = useState(user ? `${user.name.firstname} ${user.name.lastname}` : '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [zipcode, setZipcode] = useState(user?.address.zipcode ?? '')
  const [street, setStreet] = useState(user?.address.street ?? '')
  const [number, setNumber] = useState(String(user?.address.number ?? ''))
  const [city, setCity] = useState(user?.address.city ?? '')
  const [payment, setPayment] = useState<PaymentMethod>('credit')
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  if (items.length === 0) {
    return <Navigate to="/products" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 800))
    const orderState = {
      orderId: formatOrderId(),
      estimatedDelivery: formatEta(),
      items: [...items],
      subtotal,
      shipping: 0,
      total: subtotal,
    }
    clear()
    navigate('/checkout/sucesso', { state: orderState, replace: true })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Finalizar compra</h1>
      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
        Revise seus dados e confirme o pedido.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]"
        noValidate
      >
        <div className="flex flex-col gap-6">
          <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
            <header className="mb-4 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-[var(--color-primary)]" />
              <h2 className="font-semibold">Dados pessoais</h2>
            </header>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
              <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
          </section>

          <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
            <header className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[var(--color-primary)]" />
              <h2 className="font-semibold">Endereço de entrega</h2>
            </header>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <Input label="CEP" value={zipcode} onChange={(e) => setZipcode(e.target.value)} placeholder="00000-000" required autoComplete="postal-code" containerClassName="sm:col-span-2" />
              <Input label="Rua" value={street} onChange={(e) => setStreet(e.target.value)} required autoComplete="street-address" containerClassName="sm:col-span-3" />
              <Input label="Número" value={number} onChange={(e) => setNumber(e.target.value)} required inputMode="numeric" containerClassName="sm:col-span-1" />
              <Input label="Cidade" value={city} onChange={(e) => setCity(e.target.value)} required autoComplete="address-level2" containerClassName="sm:col-span-6" />
            </div>
          </section>

          <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
            <header className="mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[var(--color-primary)]" />
              <h2 className="font-semibold">Pagamento</h2>
            </header>
            <Select label="Método" value={payment} onChange={(e) => setPayment(e.target.value as PaymentMethod)}>
              <option value="credit">Cartão de crédito</option>
              <option value="pix">Pix</option>
              <option value="boleto">Boleto</option>
            </Select>
            {payment === 'credit' && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 animate-fade-in">
                <Input label="Número do cartão" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="0000 0000 0000 0000" inputMode="numeric" containerClassName="sm:col-span-2" />
                <Input label="Nome impresso" value={cardName} onChange={(e) => setCardName(e.target.value)} containerClassName="sm:col-span-2" />
                <Input label="Validade" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/AA" />
                <Input label="CVV" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} placeholder="123" inputMode="numeric" />
              </div>
            )}
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
          </section>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <CartSummary subtotal={subtotal} itemCount={totalItems} ctaLabel="Confirmar pedido" disabled />
          <Button type="submit" loading={submitting} size="lg" className="w-full">
            {submitting ? 'Processando…' : 'Confirmar pedido'}
          </Button>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Compra simulada — nenhum valor será cobrado.
          </p>
        </div>
      </form>
    </div>
  )
}
