import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const LOCALE_MAP: Record<string, string> = {
  pl: 'pl-PL',
  en: 'en-GB',
}

export function formatPrice(price: number, currency = 'PLN', locale = 'pl'): string {
  const intlLocale = LOCALE_MAP[locale] || 'pl-PL'
  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency,
  }).format(price)
}
