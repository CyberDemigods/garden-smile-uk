/**
 * Multi-tenant infrastructure types.
 *
 * This module provides the foundation for tenant isolation.
 * In single-tenant mode (default), these are no-ops.
 * When multi-tenant is enabled, collections get automatic tenant scoping.
 */

export interface Tenant {
  id: string
  slug: string
  name: string
  domain?: string
  config?: TenantConfig
}

export interface TenantConfig {
  /** Modules enabled for this tenant */
  enabledModules?: string[]
  /** Per-tenant feature flags */
  features?: Record<string, boolean>
  /** Per-tenant configuration overrides */
  settings?: Record<string, unknown>
}

export interface TenantContext {
  /** Current tenant, or null in single-tenant mode */
  tenant: Tenant | null
  /** Whether multi-tenant mode is active */
  isMultiTenant: boolean
}

export interface MultiTenantOptions {
  /** Enable multi-tenant mode */
  enabled: boolean
  /** How to resolve tenant from request */
  resolveStrategy: 'domain' | 'path' | 'header'
  /** Header name when using 'header' strategy */
  headerName?: string
  /** Collections to scope to tenant. Use '*' for all. */
  scopedCollections?: string[] | '*'
  /** Collections that are shared across tenants (e.g. 'media') */
  sharedCollections?: string[]
}
