import type { Config, Plugin } from 'payload'
import type { DemiCommerceOptions, DemiModule, ModuleContext } from './types.ts'
import { resolveModules } from './utils/resolve-modules.ts'
import { mergeCollectionConfig, mergeGlobalConfig } from './utils/merge-config.ts'

/**
 * Main assembler function. Takes DemiCommerce modules and produces a Payload CMS plugin.
 *
 * @example
 * ```ts
 * // payload.config.ts
 * export default buildConfig({
 *   plugins: [
 *     demicommerce({
 *       modules: [
 *         mediaModule(),
 *         usersModule({ roles: ['admin', 'editor'] }),
 *         productsModule(),
 *       ],
 *     }),
 *   ],
 * })
 * ```
 */
export function demicommerce(options: DemiCommerceOptions): Plugin {
  return (incomingConfig: Config): Config => {
    const config = { ...incomingConfig }

    // Resolve module load order based on dependencies
    const sortedModules = resolveModules(options.modules)

    // Collect all collections and globals from modules
    const allCollections = [...(config.collections ?? [])]
    const allGlobals = [...(config.globals ?? [])]

    // Phase 1: Gather all collections and globals
    for (const mod of sortedModules) {
      if (mod.collections) {
        allCollections.push(...mod.collections)
      }
      if (mod.globals) {
        allGlobals.push(...mod.globals)
      }
    }

    // Phase 2: Apply collection extensions from all modules
    for (const mod of sortedModules) {
      if (!mod.extendCollections) continue

      for (const [targetSlug, extension] of Object.entries(mod.extendCollections)) {
        const targetIndex = allCollections.findIndex((c) => c.slug === targetSlug)
        if (targetIndex === -1) {
          console.warn(
            `[demicommerce] Module "${mod.slug}" tries to extend collection "${targetSlug}", ` +
              `but it does not exist. Skipping.`,
          )
          continue
        }
        allCollections[targetIndex] = mergeCollectionConfig(
          allCollections[targetIndex]!,
          extension,
        )
      }
    }

    // Phase 2b: Apply global extensions from all modules
    for (const mod of sortedModules) {
      if (!mod.extendGlobals) continue

      for (const [targetSlug, extension] of Object.entries(mod.extendGlobals)) {
        const targetIndex = allGlobals.findIndex((g) => g.slug === targetSlug)
        if (targetIndex === -1) {
          console.warn(
            `[demicommerce] Module "${mod.slug}" tries to extend global "${targetSlug}", ` +
              `but it does not exist. Skipping.`,
          )
          continue
        }
        allGlobals[targetIndex] = mergeGlobalConfig(
          allGlobals[targetIndex]!,
          extension,
        )
      }
    }

    // Phase 3: Merge admin views and nav links
    const adminViews: Record<string, unknown> = {
      ...(typeof config.admin?.components?.views === 'object'
        ? config.admin.components.views
        : {}),
    }
    const afterNavLinks: string[] = [
      ...((config.admin?.components?.afterNavLinks as string[]) ?? []),
    ]

    for (const mod of sortedModules) {
      if (mod.adminViews) {
        for (const [key, view] of Object.entries(mod.adminViews)) {
          adminViews[key] = {
            Component: view.Component,
            path: view.path,
            meta: view.meta,
          }
        }
      }
    }

    // Phase 4: Register onInit hooks
    const originalOnInit = config.onInit
    const moduleMap = new Map<string, DemiModule>(
      sortedModules.map((m) => [m.slug, m]),
    )

    config.onInit = async (payload) => {
      if (originalOnInit) {
        await originalOnInit(payload)
      }

      const ctx: ModuleContext = {
        payload,
        modules: moduleMap,
        config: { modules: sortedModules },
      }

      for (const mod of sortedModules) {
        if (mod.onInit) {
          await mod.onInit(ctx)
        }
      }
    }

    // Assemble final config
    config.collections = allCollections
    config.globals = allGlobals

    if (Object.keys(adminViews).length > 0 || afterNavLinks.length > 0) {
      config.admin = {
        ...config.admin,
        components: {
          ...config.admin?.components,
          ...(Object.keys(adminViews).length > 0
            ? { views: adminViews as Config['admin'] extends { components?: { views?: infer V } } ? V : never }
            : {}),
          ...(afterNavLinks.length > 0 ? { afterNavLinks } : {}),
        },
      }
    }

    return config
  }
}

/** Alias for demicommerce() — friendlier name for shop-focused projects. */
export const assembleShop = demicommerce
