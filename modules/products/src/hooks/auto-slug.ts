import type { FieldHook } from 'payload'

/**
 * Payload field hook that auto-generates a URL-friendly slug from the name field.
 */
export const autoSlugHook: FieldHook = ({ value, data }) => {
  if (!value && data?.name) {
    return (data.name as string)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
  return value
}
