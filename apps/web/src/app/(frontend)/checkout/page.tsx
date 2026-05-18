import { CheckoutForm } from '@/components/checkout/CheckoutForm'

export const metadata = {
  title: 'Checkout',
}

export default function CheckoutPage() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-8">
        <h1 className="font-serif text-4xl sm:text-5xl text-[rgb(var(--gs-leaf-deep))]">Checkout</h1>
        <p className="text-[rgb(var(--gs-stone))] mt-2">
          One step. We&apos;ll email order updates to the address you give us.
        </p>
      </header>
      <CheckoutForm />
    </section>
  )
}
