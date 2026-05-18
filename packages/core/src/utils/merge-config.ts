import type { CollectionConfig, Field, GlobalConfig } from 'payload'

type TabsField = Extract<Field, { type: 'tabs' }>

function mergeFieldsWithTabs(base: Field[], ext: Field[]): Field[] {
  const baseTabs = base.find((f): f is TabsField => f.type === 'tabs')
  const extTabs = ext.filter((f): f is TabsField => f.type === 'tabs')
  const extNonTabs = ext.filter((f) => f.type !== 'tabs')

  if (baseTabs && extTabs.length > 0) {
    const merged = base.map((f) => {
      if (f !== baseTabs) return f
      const combinedTabs = [
        ...(baseTabs as TabsField).tabs,
        ...extTabs.flatMap((t) => t.tabs),
      ]
      return { ...baseTabs, tabs: combinedTabs } as Field
    })
    return [...merged, ...extNonTabs]
  }

  return [...base, ...ext]
}

/**
 * Deep merges a partial collection config into a base collection config.
 * Arrays (like fields) are concatenated, objects are recursively merged,
 * and primitives are overwritten by the extension.
 */
export function mergeCollectionConfig(
  base: CollectionConfig,
  extension: Partial<CollectionConfig>,
): CollectionConfig {
  const result = { ...base }

  for (const key of Object.keys(extension) as Array<keyof CollectionConfig>) {
    const baseVal = base[key]
    const extVal = extension[key]

    if (extVal === undefined) continue

    if (key === 'fields' && Array.isArray(baseVal) && Array.isArray(extVal)) {
      // Concatenate fields arrays
      ;(result as Record<string, unknown>)[key] = [...baseVal, ...extVal]
    } else if (
      baseVal !== null &&
      extVal !== null &&
      typeof baseVal === 'object' &&
      typeof extVal === 'object' &&
      !Array.isArray(baseVal) &&
      !Array.isArray(extVal)
    ) {
      // Recursively merge objects
      ;(result as Record<string, unknown>)[key] = {
        ...(baseVal as Record<string, unknown>),
        ...(extVal as Record<string, unknown>),
      }
    } else {
      // Overwrite primitives and other values
      ;(result as Record<string, unknown>)[key] = extVal
    }
  }

  return result
}

/**
 * Deep merges a partial global config into a base global config.
 * Fields arrays are concatenated, objects are recursively merged,
 * and primitives are overwritten by the extension.
 */
export function mergeGlobalConfig(
  base: GlobalConfig,
  extension: Partial<GlobalConfig>,
): GlobalConfig {
  const result = { ...base }

  for (const key of Object.keys(extension) as Array<keyof GlobalConfig>) {
    const baseVal = base[key]
    const extVal = extension[key]

    if (extVal === undefined) continue

    if (key === 'fields' && Array.isArray(baseVal) && Array.isArray(extVal)) {
      ;(result as Record<string, unknown>)[key] = mergeFieldsWithTabs(
        baseVal as unknown as Field[],
        extVal as unknown as Field[],
      )
    } else if (
      baseVal !== null &&
      extVal !== null &&
      typeof baseVal === 'object' &&
      typeof extVal === 'object' &&
      !Array.isArray(baseVal) &&
      !Array.isArray(extVal)
    ) {
      ;(result as Record<string, unknown>)[key] = {
        ...(baseVal as Record<string, unknown>),
        ...(extVal as Record<string, unknown>),
      }
    } else {
      ;(result as Record<string, unknown>)[key] = extVal
    }
  }

  return result
}
