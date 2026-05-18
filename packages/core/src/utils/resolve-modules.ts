import type { DemiModule } from '../types.ts'

/**
 * Topologically sorts modules based on their dependency declarations.
 * Ensures that if module A depends on module B, B appears before A in the result.
 *
 * @throws Error if a circular dependency is detected
 * @throws Error if a required dependency is missing
 */
export function resolveModules(modules: DemiModule[]): DemiModule[] {
  const moduleMap = new Map<string, DemiModule>()
  for (const mod of modules) {
    moduleMap.set(mod.slug, mod)
  }

  // Validate all dependencies exist
  for (const mod of modules) {
    if (!mod.dependencies) continue
    for (const depSlug of Object.keys(mod.dependencies)) {
      if (!moduleMap.has(depSlug)) {
        throw new Error(
          `Module "${mod.slug}" depends on "${depSlug}", but it is not registered. ` +
            `Available modules: ${modules.map((m) => m.slug).join(', ')}`,
        )
      }
    }
  }

  // Kahn's algorithm for topological sort
  const inDegree = new Map<string, number>()
  const adjacency = new Map<string, string[]>()

  for (const mod of modules) {
    inDegree.set(mod.slug, 0)
    adjacency.set(mod.slug, [])
  }

  for (const mod of modules) {
    if (!mod.dependencies) continue
    for (const depSlug of Object.keys(mod.dependencies)) {
      adjacency.get(depSlug)!.push(mod.slug)
      inDegree.set(mod.slug, (inDegree.get(mod.slug) ?? 0) + 1)
    }
  }

  const queue: string[] = []
  for (const [slug, degree] of inDegree) {
    if (degree === 0) {
      queue.push(slug)
    }
  }

  const sorted: DemiModule[] = []
  while (queue.length > 0) {
    const current = queue.shift()!
    sorted.push(moduleMap.get(current)!)

    for (const neighbor of adjacency.get(current) ?? []) {
      const newDegree = (inDegree.get(neighbor) ?? 1) - 1
      inDegree.set(neighbor, newDegree)
      if (newDegree === 0) {
        queue.push(neighbor)
      }
    }
  }

  if (sorted.length !== modules.length) {
    const remaining = modules
      .filter((m) => !sorted.some((s) => s.slug === m.slug))
      .map((m) => m.slug)
    throw new Error(
      `Circular dependency detected among modules: ${remaining.join(', ')}`,
    )
  }

  return sorted
}
