import type { CollectionConfig, GlobalConfig, Payload } from 'payload'

/**
 * Configuration for an admin navigation link added by a module.
 */
export interface AdminNavLink {
  label: string
  href: string
  icon?: string
  order?: number
}

/**
 * Configuration for an admin view added by a module.
 */
export interface AdminViewConfig {
  Component: string
  path: string
  meta?: {
    title?: string
    description?: string
  }
}

/**
 * Context provided to module lifecycle hooks.
 */
export interface ModuleContext {
  payload: Payload
  modules: Map<string, DemiModule>
  config: AppConfig
}

/**
 * Application-level configuration passed to the demicommerce() assembler.
 */
export interface AppConfig {
  modules: DemiModule[]
}

/**
 * Core module definition. Every DemiCommerce module implements this interface.
 *
 * A module can:
 * - Define its own collections and globals
 * - Extend collections from other modules via extendCollections
 * - Add admin views and nav links
 * - Provide i18n messages
 * - Run initialization logic via onInit
 */
export interface DemiModule {
  /** Unique identifier for the module (e.g. "media", "products") */
  slug: string

  /** Human-readable module name */
  name: string

  /** Semver version string */
  version: string

  /** Dependencies on other modules: { "media": "^1.0.0" } */
  dependencies?: Record<string, string>

  /** Payload collections provided by this module */
  collections?: CollectionConfig[]

  /** Payload globals provided by this module */
  globals?: GlobalConfig[]

  /**
   * Extend collections defined by other modules.
   * Key is the collection slug, value is a partial CollectionConfig
   * that will be deep-merged into the target collection.
   */
  extendCollections?: Record<string, Partial<CollectionConfig>>

  /**
   * Extend globals defined by other modules.
   * Key is the global slug, value is a partial GlobalConfig
   * that will be deep-merged into the target global.
   */
  extendGlobals?: Record<string, Partial<GlobalConfig>>

  /** Admin views to register */
  adminViews?: Record<string, AdminViewConfig>

  /** Admin navigation links to add */
  adminNavLinks?: AdminNavLink[]

  /** i18n messages: { en: { ... }, pl: { ... } } */
  messages?: Record<string, Record<string, unknown>>

  /** Called after Payload initializes. Use for seeding, validation, etc. */
  onInit?: (ctx: ModuleContext) => void | Promise<void>
}

/**
 * Options for the createModule() factory function.
 * Same as DemiModule but slug, name, and version are required;
 * everything else is optional.
 */
export type CreateModuleOptions = DemiModule

/**
 * Options passed to the demicommerce() assembler function.
 */
export interface DemiCommerceOptions {
  modules: DemiModule[]
}
