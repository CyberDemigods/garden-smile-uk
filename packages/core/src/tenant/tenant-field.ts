import type { Field } from 'payload'

/**
 * Creates a tenant ID field that can be added to collections
 * for tenant-scoped data isolation.
 */
export function tenantField(options?: { hidden?: boolean }): Field {
  return {
    name: 'tenant',
    type: 'text',
    label: 'Tenant',
    index: true,
    admin: {
      hidden: options?.hidden ?? true,
      readOnly: true,
    },
    hooks: {
      beforeValidate: [
        ({ req, value }) => {
          // Auto-populate from request context if not set
          const tenantId = (req as unknown as Record<string, unknown>).tenantId as string | undefined
          if (!value && tenantId) {
            return tenantId
          }
          return value
        },
      ],
    },
  }
}
