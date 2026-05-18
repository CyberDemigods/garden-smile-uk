import type { DemiModule, CreateModuleOptions } from './types.ts'

/**
 * Factory function for creating DemiCommerce modules.
 * Provides a standard way to define modules with sensible defaults.
 *
 * @example
 * ```ts
 * export const mediaModule = (options?: MediaOptions) =>
 *   createModule({
 *     slug: 'media',
 *     name: 'Media',
 *     version: '0.1.0',
 *     collections: [MediaCollection],
 *   })
 * ```
 */
export function createModule(options: CreateModuleOptions): DemiModule {
  return {
    slug: options.slug,
    name: options.name,
    version: options.version,
    dependencies: options.dependencies ?? {},
    collections: options.collections ?? [],
    globals: options.globals ?? [],
    extendCollections: options.extendCollections ?? {},
    extendGlobals: options.extendGlobals ?? {},
    adminViews: options.adminViews ?? {},
    adminNavLinks: options.adminNavLinks ?? [],
    messages: options.messages ?? {},
    onInit: options.onInit,
  }
}
