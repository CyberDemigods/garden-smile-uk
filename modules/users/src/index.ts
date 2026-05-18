import { createModule } from '@demicommerce/core'
import type { DemiModule } from '@demicommerce/core'
import { createUsersCollection } from './collections/Users.ts'

export interface UsersModuleOptions {
  /** Role definitions. Defaults to admin + editor. */
  roles?: Array<{ label: string; value: string }>
  /** Default role for new users. Defaults to 'editor'. */
  defaultRole?: string
}

const DEFAULT_ROLES = [
  { label: 'Admin', value: 'admin' },
  { label: 'Editor', value: 'editor' },
]

export function usersModule(options?: UsersModuleOptions): DemiModule {
  const roles = options?.roles ?? DEFAULT_ROLES
  const defaultRole = options?.defaultRole ?? 'editor'

  return createModule({
    slug: 'users',
    name: 'Users',
    version: '0.1.0',
    collections: [createUsersCollection({ roles, defaultRole })],
  })
}
