'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@demicommerce/module-cart/use-cart'
import { createOrderAction } from '@/app/actions/checkout'

const formatPrice = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount)

export function CheckoutForm() {
  const { items, totalAmount } = useCart()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const router = useRouter()

  // Cart is localStorage-backed → only renders after hydration. Until then,
  // render a skeleton instead of jumping the user to /shop on the server pass.
  useEffect(() => setHydrated(true), [])

  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace('/shop')
    }
  }, [hydrated, items.length, router])

  if (!hydrated) {
    return <div className="h-64 animate-pulse bg-white/40 rounded-2xl" />
  }
  if (items.length === 0) return null

  const onSubmit = async (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      try {
        await createOrderAction({
          customerEmail: String(formData.get('customerEmail') ?? ''),
          customerName: String(formData.get('customerName') ?? ''),
          customerPhone: String(formData.get('customerPhone') ?? '') || undefined,
          street: String(formData.get('street') ?? ''),
          city: String(formData.get('city') ?? ''),
          postalCode: String(formData.get('postalCode') ?? ''),
          county: String(formData.get('county') ?? '') || undefined,
          country: String(formData.get('country') ?? 'United Kingdom'),
          notes: String(formData.get('notes') ?? '') || undefined,
          items: items.map((it) => ({ productSlug: it.slug, quantity: it.quantity })),
        })
      } catch (err) {
        // redirect() throws a NEXT_REDIRECT error which we want to bubble up;
        // anything else is a real validation/server failure.
        const message = err instanceof Error ? err.message : 'Order failed'
        if (message.includes('NEXT_REDIRECT')) throw err
        setError(message)
      }
    })
  }

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-10">
      <form action={onSubmit} className="space-y-6">
        <Section title="Contact">
          <Field label="Email" name="customerEmail" type="email" required autoComplete="email" />
          <Field label="Phone (optional)" name="customerPhone" type="tel" autoComplete="tel" />
        </Section>

        <Section title="Shipping address">
          <Field label="Full name" name="customerName" required autoComplete="name" />
          <Field label="Street and number" name="street" required autoComplete="street-address" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Postcode" name="postalCode" required autoComplete="postal-code" />
            <Field label="City" name="city" required autoComplete="address-level2" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="County (optional)" name="county" autoComplete="address-level1" />
            <Field
              label="Country"
              name="country"
              required
              defaultValue="United Kingdom"
              autoComplete="country-name"
            />
          </div>
        </Section>

        <Section title="Order notes (optional)">
          <textarea
            name="notes"
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white border border-[rgb(var(--gs-leaf-light)/0.4)] focus:border-[rgb(var(--gs-leaf))] focus:outline-none text-[rgb(var(--gs-stone))]"
            placeholder="Anything we should know about delivery?"
          />
        </Section>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full px-6 py-4 rounded-full bg-[rgb(var(--gs-leaf))] text-white font-medium hover:bg-[rgb(var(--gs-leaf-deep))] transition disabled:opacity-50"
        >
          {pending ? 'Placing order…' : 'Place order'}
        </button>
        <p className="text-xs text-center text-[rgb(var(--gs-stone)/0.6)]">
          Payment integration ships in the next milestone — orders are saved as
          &ldquo;pending payment&rdquo; for now.
        </p>
      </form>

      <aside className="lg:sticky lg:top-28 lg:self-start bg-white/60 rounded-2xl border border-[rgb(var(--gs-leaf-light)/0.18)] p-6 space-y-4 h-fit">
        <h2 className="font-serif text-2xl text-[rgb(var(--gs-leaf-deep))]">Your order</h2>
        <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3">
              <div className="w-14 h-14 relative rounded-lg overflow-hidden bg-[rgb(var(--gs-cream))] flex-shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[rgb(var(--gs-leaf-deep))] line-clamp-2">{item.name}</p>
                <p className="text-xs text-[rgb(var(--gs-stone))]">
                  {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <span className="text-sm font-medium text-[rgb(var(--gs-leaf-deep))] whitespace-nowrap">
                {formatPrice(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t border-[rgb(var(--gs-leaf-light)/0.25)] pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-[rgb(var(--gs-stone))]">
            <span>Subtotal</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>
          <div className="flex justify-between text-[rgb(var(--gs-stone))]">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between text-base font-medium text-[rgb(var(--gs-leaf-deep))] pt-2 border-t border-[rgb(var(--gs-leaf-light)/0.18)]">
            <span>Total</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>
        </div>
        <Link
          href="/shop"
          className="block text-xs text-center text-[rgb(var(--gs-stone)/0.7)] hover:text-[rgb(var(--gs-leaf))] underline"
        >
          ← Continue shopping
        </Link>
      </aside>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="font-serif text-xl text-[rgb(var(--gs-leaf-deep))] mb-2">{title}</legend>
      {children}
    </fieldset>
  )
}

interface FieldProps {
  label: string
  name: string
  type?: string
  required?: boolean
  defaultValue?: string
  autoComplete?: string
}

function Field({ label, name, type = 'text', required, defaultValue, autoComplete }: FieldProps) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-[rgb(var(--gs-stone))] mb-1.5 block">
        {label}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        className="w-full px-4 py-3 rounded-xl bg-white border border-[rgb(var(--gs-leaf-light)/0.4)] focus:border-[rgb(var(--gs-leaf))] focus:outline-none text-[rgb(var(--gs-stone))]"
      />
    </label>
  )
}
