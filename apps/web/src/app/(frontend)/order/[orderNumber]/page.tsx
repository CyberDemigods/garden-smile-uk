import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { ClearCartOnMount } from '@/components/checkout/ClearCartOnMount'
import { PurchaseTracker } from '@/components/consent/MarketingHost'
import { ProductCard } from '@/components/shop/ProductCard'
import { getCrossSellProducts } from '@/lib/queries'
import { readMarketingConfig } from '@demicommerce/module-marketing/helpers'

interface OrderPageProps {
  params: Promise<{ orderNumber: string }>
}

export const metadata = {
  title: 'Order confirmation',
}

const formatPrice = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount)

const STATUS_COPY: Record<string, { label: string; tone: string }> = {
  pending: { label: 'Awaiting payment', tone: 'bg-amber-100 text-amber-800' },
  paid: { label: 'Paid', tone: 'bg-emerald-100 text-emerald-800' },
  shipped: { label: 'Shipped', tone: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Completed', tone: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'Cancelled', tone: 'bg-stone-200 text-stone-700' },
}

interface OrderDoc {
  orderNumber: string
  status: keyof typeof STATUS_COPY
  totalAmount: number
  shippingCost?: number
  customerEmail: string
  customerName: string
  customerPhone?: string
  shippingAddress?: {
    street?: string
    city?: string
    postalCode?: string
    county?: string
    country?: string
  }
  items: Array<{ productName: string; price: number; quantity: number }>
  createdAt: string
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderNumber } = await params
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'orders' as never,
    where: { orderNumber: { equals: orderNumber } } as never,
    limit: 1,
    depth: 0,
    locale: 'en' as never,
    overrideAccess: true,
  })

  if (result.totalDocs === 0) notFound()
  const order = result.docs[0] as unknown as OrderDoc

  const statusInfo = STATUS_COPY[order.status] ?? {
    label: order.status,
    tone: 'bg-stone-200 text-stone-700',
  }

  const subtotal = order.items.reduce((sum, it) => sum + it.price * it.quantity, 0)
  const addr = order.shippingAddress

  const settings = await payload.findGlobal({ slug: 'shop-settings' as never, depth: 0 })
  const marketing = readMarketingConfig(settings)
  const crossSell = await getCrossSellProducts(payload, [], 4)

  return (
    <section className="max-w-3xl mx-auto px-6 py-12">
      <ClearCartOnMount />
      <PurchaseTracker
        config={marketing}
        data={{
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          currency: 'GBP',
          items: order.items.map((it, i) => ({
            productId: i,
            name: it.productName,
            price: it.price,
            quantity: it.quantity,
          })),
        }}
      />

      <div className="text-center mb-10">
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusInfo.tone}`}>
          {statusInfo.label}
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-[rgb(var(--gs-leaf-deep))] mt-4">
          Thanks for your order
        </h1>
        <p className="text-[rgb(var(--gs-stone))] mt-2">
          Order <span className="font-mono text-[rgb(var(--gs-leaf-deep))]">{order.orderNumber}</span> ·
          a confirmation copy was sent to <strong>{order.customerEmail}</strong>.
        </p>
      </div>

      <div className="bg-white/70 rounded-2xl border border-[rgb(var(--gs-leaf-light)/0.18)] p-6 mb-6">
        <h2 className="font-serif text-xl text-[rgb(var(--gs-leaf-deep))] mb-4">Items</h2>
        <ul className="divide-y divide-[rgb(var(--gs-leaf-light)/0.18)]">
          {order.items.map((it, i) => (
            <li key={i} className="py-3 flex justify-between gap-4">
              <span className="text-[rgb(var(--gs-stone))]">
                {it.productName}
                <span className="text-[rgb(var(--gs-stone)/0.6)] ml-2">× {it.quantity}</span>
              </span>
              <span className="text-[rgb(var(--gs-leaf-deep))] font-medium whitespace-nowrap">
                {formatPrice(it.price * it.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t border-[rgb(var(--gs-leaf-light)/0.25)] space-y-1.5 text-sm">
          <div className="flex justify-between text-[rgb(var(--gs-stone))]">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {(order.shippingCost ?? 0) > 0 && (
            <div className="flex justify-between text-[rgb(var(--gs-stone))]">
              <span>Shipping</span>
              <span>{formatPrice(order.shippingCost ?? 0)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-medium text-[rgb(var(--gs-leaf-deep))] pt-2 border-t border-[rgb(var(--gs-leaf-light)/0.18)]">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {addr && (
        <div className="bg-white/70 rounded-2xl border border-[rgb(var(--gs-leaf-light)/0.18)] p-6 mb-6">
          <h2 className="font-serif text-xl text-[rgb(var(--gs-leaf-deep))] mb-4">Shipping to</h2>
          <p className="text-[rgb(var(--gs-stone))]">
            {order.customerName}
            <br />
            {addr.street}
            <br />
            {[addr.postalCode, addr.city].filter(Boolean).join(' ')}
            {addr.county && (
              <>
                <br />
                {addr.county}
              </>
            )}
            <br />
            {addr.country}
            {order.customerPhone && (
              <>
                <br />
                <span className="text-sm text-[rgb(var(--gs-stone)/0.7)]">
                  {order.customerPhone}
                </span>
              </>
            )}
          </p>
        </div>
      )}

      {crossSell.length > 0 && (
        <section className="mt-16 mb-10">
          <h2 className="font-serif text-2xl text-[rgb(var(--gs-leaf-deep))] mb-6 text-center">
            Customers also bought
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {crossSell.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      <div className="text-center">
        <Link
          href="/shop"
          className="inline-block px-6 py-3 rounded-full border-2 border-[rgb(var(--gs-leaf))] text-[rgb(var(--gs-leaf))] font-medium hover:bg-[rgb(var(--gs-leaf-light)/0.12)] transition"
        >
          Continue shopping
        </Link>
      </div>
    </section>
  )
}
