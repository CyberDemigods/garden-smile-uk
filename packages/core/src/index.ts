// Main assembler
export { demicommerce, assembleShop } from './demicommerce.ts'

// Module factory
export { createModule } from './create-module.ts'

// Types
export type {
  DemiModule,
  DemiCommerceOptions,
  ModuleContext,
  AppConfig,
  CreateModuleOptions,
  AdminNavLink,
  AdminViewConfig,
} from './types.ts'

// Utilities
export { mergeCollectionConfig, mergeGlobalConfig } from './utils/merge-config.ts'
export { resolveModules } from './utils/resolve-modules.ts'

// Multi-tenant
export { tenantField, scopeCollectionToTenant } from './tenant/index.ts'
export type { Tenant, TenantConfig, TenantContext, MultiTenantOptions } from './tenant/index.ts'
