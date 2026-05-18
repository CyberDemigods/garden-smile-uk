import type { CollectionConfig, Where } from 'payload'
import { tenantField } from './tenant-field.ts'

/**
 * Wraps a collection config with tenant scoping.
 * Adds a tenant field and modifies access control to filter by tenant.
 */
export function scopeCollectionToTenant(collection: CollectionConfig): CollectionConfig {
  return {
    ...collection,
    fields: [
      tenantField(),
      ...collection.fields,
    ],
    access: {
      ...collection.access,
      read: (args) => {
        const tenantId = (args.req as unknown as Record<string, unknown>).tenantId as string | undefined

        // If no tenant context, fall back to original access
        if (!tenantId) {
          if (typeof collection.access?.read === 'function') {
            return collection.access.read(args)
          }
          return true
        }

        // Scope reads to current tenant
        const tenantFilter: Where = { tenant: { equals: tenantId } }
        const originalAccess = collection.access?.read
        if (typeof originalAccess === 'function') {
          const result = originalAccess(args)
          if (typeof result === 'boolean') {
            return result ? tenantFilter : false
          }
          // Merge with existing where clause
          return { and: [tenantFilter, result as Where] }
        }
        return tenantFilter
      },
    },
  }
}
