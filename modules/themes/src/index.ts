import { createModule } from '@demicommerce/core'
import type { DemiModule, ModuleContext } from '@demicommerce/core'
import { ThemesCollection } from './collections/Themes.ts'
import { BUILTIN_THEMES } from './registry.ts'

export interface ThemesModuleOptions {
  /** When true, seeds built-in themes on first init if not already present. Default: true. */
  seedBuiltIns?: boolean
}

export function themesModule(options?: ThemesModuleOptions): DemiModule {
  const seedBuiltIns = options?.seedBuiltIns ?? true

  return createModule({
    slug: 'themes',
    name: 'Themes',
    version: '0.1.0',
    collections: [ThemesCollection],
    extendGlobals: {
      'shop-settings': {
        fields: [
          {
            type: 'tabs',
            tabs: [
              {
                label: 'Appearance',
                fields: [
                  {
                    name: 'themeOverride',
                    type: 'relationship',
                    relationTo: 'themes' as never,
                    label: 'Theme override',
                    admin: {
                      description:
                        'Force a specific theme regardless of seasonal schedule. Leave empty to auto-resolve from active season.',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    onInit: seedBuiltIns
      ? async (ctx: ModuleContext) => {
          const payload = ctx.payload
          for (const theme of BUILTIN_THEMES) {
            const existing = await payload.find({
              collection: 'themes' as never,
              where: { slug: { equals: theme.slug } },
              limit: 1,
            })
            if (existing.docs.length > 0) continue

            await payload.create({
              collection: 'themes' as never,
              data: {
                name: theme.name,
                slug: theme.slug,
                description: theme.description,
                accent: theme.accent,
                accentForeground: theme.accentForeground,
                accentDark: theme.accentDark,
                heroGradientFrom: theme.heroGradient?.from ?? '',
                heroGradientVia: theme.heroGradient?.via ?? '',
                heroGradientTo: theme.heroGradient?.to ?? '',
                decoration: theme.decoration,
                isBuiltIn: true,
              } as never,
            })
            console.log(`[themes] seeded built-in theme: ${theme.slug}`)
          }
        }
      : undefined,
  })
}

export { ThemesCollection } from './collections/Themes.ts'
export { BUILTIN_THEMES, getThemeBySlug, DEFAULT_THEME_SLUG } from './registry.ts'
export type { ThemeDefinition, DecorationKind } from './registry.ts'
