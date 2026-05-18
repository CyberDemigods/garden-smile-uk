'use server'

import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'

export interface CheckoutItemInput {
  productSlug: string
  quantity: number
}

export interface CheckoutFormInput {
  customerEmail: string
  customerName: string
  customerPhone?: string
  street: string
  city: string
  postalCode: string
  county?: string
  country: string
  notes?: string
  items: CheckoutItemInput[]
}

const SHIPPING_COST = 0 // Flat free shipping for the MVP — wired up properly with module-shop-settings later.

const generateOrderNumber = () => {
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `GS-${ymd}-${rand}`
}

interface ProductLookup {
  id: string | number
  name: string
  price: number
  slug: string
  status: 'available' | 'sold' | 'hidden'
  stock: number
}

/**
 * Validate cart items against the product catalogue and compute the order
 * total server-side. Never trust the client's prices.
 */
async function buildOrderItems(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  items: CheckoutItemInput[],
): Promise<{
  items: Array<{ product: string | number; productName: string; price: number; quantity: number }>
  subtotal: number
}> {
  if (items.length === 0) throw new Error('Cart is empty')

  const slugs = items.map((it) => it.productSlug)
  const result = await payload.find({
    collection: 'products' as never,
    where: { slug: { in: slugs } } as never,
    limit: items.length,
    depth: 0,
    locale: 'en' as never,
  })
  const lookups = new Map<string, ProductLookup>()
  for (const doc of result.docs as ProductLookup[]) {
    lookups.set(doc.slug, doc)
  }

  const orderItems: Array<{
    product: string | number
    productName: string
    price: number
    quantity: number
  }> = []
  let subtotal = 0

  for (const it of items) {
    const p = lookups.get(it.productSlug)
    if (!p) throw new Error(`Product not found: ${it.productSlug}`)
    if (p.status !== 'available') throw new Error(`Product not available: ${p.name}`)
    const qty = Math.max(1, Math.floor(it.quantity))
    orderItems.push({
      product: p.id,
      productName: p.name,
      price: p.price,
      quantity: qty,
    })
    subtotal += p.price * qty
  }

  return { items: orderItems, subtotal }
}

export interface CheckoutResult {
  orderNumber: string
}

export async function createOrderAction(input: CheckoutFormInput): Promise<CheckoutResult> {
  // Minimal server-side validation — UI does heavier lifting.
  const required: Array<keyof CheckoutFormInput> = [
    'customerEmail',
    'customerName',
    'street',
    'city',
    'postalCode',
    'country',
  ]
  for (const field of required) {
    if (!input[field] || String(input[field]).trim().length === 0) {
      throw new Error(`Missing required field: ${field}`)
    }
  }

  const payload = await getPayloadClient()
  const { items, subtotal } = await buildOrderItems(payload, input.items)

  const orderNumber = generateOrderNumber()
  const totalAmount = Math.round((subtotal + SHIPPING_COST) * 100) / 100

  await payload.create({
    collection: 'orders' as never,
    data: {
      orderNumber,
      status: 'pending',
      items,
      totalAmount,
      shippingCost: SHIPPING_COST,
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      shippingAddress: {
        street: input.street,
        city: input.city,
        postalCode: input.postalCode,
        county: input.county,
        country: input.country,
      },
      notes: input.notes,
      locale: 'en',
    } as never,
    overrideAccess: true,
  })

  redirect(`/order/${orderNumber}`)
}
