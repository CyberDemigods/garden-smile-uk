import type { CollectionConfig } from 'payload'

export interface UsersCollectionOptions {
  roles: Array<{ label: string; value: string }>
  defaultRole: string
}

export function createUsersCollection(options: UsersCollectionOptions): CollectionConfig {
  return {
    slug: 'users',
    admin: {
      useAsTitle: 'email',
      description: 'Admin panel users',
    },
    auth: true,
    fields: [
      {
        name: 'name',
        type: 'text',
        label: 'Full name',
      },
      {
        name: 'role',
        type: 'select',
        label: 'Role',
        defaultValue: options.defaultRole,
        options: options.roles,
        access: {
          update: ({ req }) => {
            const user = req.user as { role?: string } | undefined
            return user?.role === 'admin'
          },
        },
      },
    ],
  }
}
