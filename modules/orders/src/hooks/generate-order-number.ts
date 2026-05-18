import type { FieldHook } from 'payload'

/**
 * Generates a unique order number if not already set.
 * Format: ORD-{timestamp_base36}-{random_4chars}
 */
export const generateOrderNumberHook: FieldHook = ({ value }) => {
  if (!value) {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `ORD-${timestamp}-${random}`
  }
  return value
}
