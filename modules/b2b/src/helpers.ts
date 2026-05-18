import type { Payload, PayloadRequest } from 'payload'

type PayloadLike = Payload | PayloadRequest['payload']

export interface CustomerGroupLite {
  id: string | number
  slug: string
  name: string
  discountPercent: number
  netPricing: boolean
  defaultTaxExempt: boolean
  requireVatNumber: boolean
  paymentTermsDays: number
  isDefault: boolean
}

export interface UserB2BProfile {
  id: string | number
  email?: string
  customerGroup?: CustomerGroupLite | null
  companyName?: string
  vatNumber?: string
  vatNumberValid?: boolean
  taxExempt?: boolean
}

export interface PriceForUser {
  /** Final price after group discount, in the original currency. */
  price: number
  /** Base price before any discount. */
  originalPrice: number
  /** Discount applied (0..100). */
  discountPercent: number
  /** Whether the storefront should display this price as net-of-VAT. */
  netPricing: boolean
}

/**
 * Pure helper — compute discounted price for a given group.
 * Rounds to 2 decimal places.
 */
export function applyGroupDiscount(
  basePrice: number,
  group: Pick<CustomerGroupLite, 'discountPercent' | 'netPricing'> | null | undefined,
): PriceForUser {
  const discountPercent = group?.discountPercent ?? 0
  const netPricing = group?.netPricing ?? false
  const discounted = basePrice * (1 - discountPercent / 100)
  return {
    price: Math.round(discounted * 100) / 100,
    originalPrice: basePrice,
    discountPercent,
    netPricing,
  }
}

/**
 * Compute the price a specific user sees for a base product price.
 * Falls back to the default group if the user has no group assigned.
 * Returns base price unchanged when the b2b module is not active or no groups exist.
 */
export async function getPriceForUser(
  payload: PayloadLike,
  basePrice: number,
  userId: string | number | null | undefined,
): Promise<PriceForUser> {
  if (!userId) {
    const fallback = await getDefaultGroup(payload)
    return applyGroupDiscount(basePrice, fallback)
  }

  try {
    const user = (await payload.findByID({
      collection: 'users' as never,
      id: userId as never,
      depth: 1,
    })) as UserB2BProfile | null
    if (!user) return applyGroupDiscount(basePrice, null)
    const group =
      user.customerGroup && typeof user.customerGroup === 'object'
        ? (user.customerGroup as CustomerGroupLite)
        : await getDefaultGroup(payload)
    return applyGroupDiscount(basePrice, group)
  } catch {
    return applyGroupDiscount(basePrice, null)
  }
}

/**
 * Resolve the group flagged isDefault, or null when no group is marked default.
 */
export async function getDefaultGroup(payload: PayloadLike): Promise<CustomerGroupLite | null> {
  try {
    const result = await payload.find({
      collection: 'customer-groups' as never,
      where: { isDefault: { equals: true } } as never,
      limit: 1,
      depth: 0,
    })
    if (result.totalDocs === 0) return null
    return toGroupLite(result.docs[0] as Record<string, unknown>)
  } catch {
    return null
  }
}

/**
 * Get-by-slug — used by storefronts to fetch a known group (e.g. "wholesale").
 */
export async function getGroupBySlug(
  payload: PayloadLike,
  slug: string,
): Promise<CustomerGroupLite | null> {
  try {
    const result = await payload.find({
      collection: 'customer-groups' as never,
      where: { slug: { equals: slug } } as never,
      limit: 1,
      depth: 0,
    })
    if (result.totalDocs === 0) return null
    return toGroupLite(result.docs[0] as Record<string, unknown>)
  } catch {
    return null
  }
}

/**
 * Effective tax-exempt status: per-user override wins, then group default, then false.
 */
export function getEffectiveTaxExempt(
  user: Pick<UserB2BProfile, 'taxExempt' | 'customerGroup'> | null | undefined,
): boolean {
  if (!user) return false
  if (typeof user.taxExempt === 'boolean') return user.taxExempt
  if (user.customerGroup && typeof user.customerGroup === 'object') {
    return Boolean((user.customerGroup as CustomerGroupLite).defaultTaxExempt)
  }
  return false
}

export interface VatValidationResult {
  valid: boolean
  countryCode: string
  vatNumber: string
  /** Trader name returned by VIES, when available. */
  name?: string
  /** Trader address returned by VIES, when available. */
  address?: string
  /** Set when validation failed (network error, malformed input, VIES error). */
  error?: string
}

const VIES_REST_URL =
  'https://ec.europa.eu/taxation_customs/vies/rest-api/ms/{country}/vat/{vat}'

/**
 * Validate an EU VAT number against VIES (the official EU VAT validation service).
 *
 * - Accepts country code (ISO 2-letter, uppercase) and the numeric part.
 * - When the input is a single combined string like "DE123456789", it is split.
 * - VIES is occasionally down or rate-limited per country member state. On any
 *   failure we return { valid: false, error } so callers can decide whether to
 *   accept the number provisionally and re-check later.
 */
export async function validateVatNumber(
  countryOrCombined: string,
  vatNumber?: string,
): Promise<VatValidationResult> {
  let country: string
  let number: string
  if (vatNumber) {
    country = countryOrCombined.toUpperCase()
    number = vatNumber.replace(/\s+/g, '')
  } else {
    const combined = countryOrCombined.replace(/\s+/g, '').toUpperCase()
    country = combined.slice(0, 2)
    number = combined.slice(2)
  }

  if (!/^[A-Z]{2}$/.test(country) || number.length === 0) {
    return { valid: false, countryCode: country, vatNumber: number, error: 'Malformed VAT number' }
  }

  const url = VIES_REST_URL.replace('{country}', country).replace('{vat}', number)

  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) {
      return {
        valid: false,
        countryCode: country,
        vatNumber: number,
        error: `VIES HTTP ${res.status}`,
      }
    }
    const body = (await res.json()) as {
      isValid?: boolean
      valid?: boolean
      name?: string
      address?: string
      userError?: string
    }
    const valid = Boolean(body.isValid ?? body.valid)
    return {
      valid,
      countryCode: country,
      vatNumber: number,
      name: body.name,
      address: body.address,
      error: valid ? undefined : body.userError,
    }
  } catch (err) {
    return {
      valid: false,
      countryCode: country,
      vatNumber: number,
      error: err instanceof Error ? err.message : 'VIES request failed',
    }
  }
}

function toGroupLite(doc: Record<string, unknown>): CustomerGroupLite {
  return {
    id: doc.id as string | number,
    slug: (doc.slug as string) ?? '',
    name: (doc.name as string) ?? '',
    discountPercent: Number(doc.discountPercent ?? 0),
    netPricing: Boolean(doc.netPricing),
    defaultTaxExempt: Boolean(doc.defaultTaxExempt),
    requireVatNumber: Boolean(doc.requireVatNumber),
    paymentTermsDays: Number(doc.paymentTermsDays ?? 0),
    isDefault: Boolean(doc.isDefault),
  }
}
