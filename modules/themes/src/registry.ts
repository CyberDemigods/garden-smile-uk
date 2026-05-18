/**
 * Built-in seasonal themes — palette + decorative element kind.
 *
 * Each theme defines `accent` colour (the seasonal "spark") + which
 * decorative effect runs on the page. The `primary` palette deliberately
 * stays neutral (slate) so light/dark mode keeps working orthogonally —
 * theme controls the *seasonal flavour*, dark mode controls the *brightness*.
 *
 * Colour values are stored as space-separated RGB triplets so Tailwind can
 * consume them via `rgb(var(--color-accent) / <alpha-value>)`.
 */

export type DecorationKind = 'none' | 'snowflakes' | 'spiders' | 'eggs' | 'hearts' | 'leaves' | 'sparkles'

export interface ThemeDefinition {
  slug: string
  name: string
  description: string
  /** RGB triplet, e.g. "37 99 235" */
  accent: string
  /** RGB triplet for the on-accent foreground (label colour). */
  accentForeground: string
  /** RGB triplet used for the dark-mode accent variant. */
  accentDark: string
  /** Optional gradient stops for the hero (RGB triplets). */
  heroGradient?: { from: string; via?: string; to: string }
  decoration: DecorationKind
}

export const BUILTIN_THEMES: ThemeDefinition[] = [
  {
    slug: 'default',
    name: 'Default',
    description: 'Neutral baseline. No seasonal decorations.',
    accent: '37 99 235',          // blue-600
    accentForeground: '255 255 255',
    accentDark: '96 165 250',     // blue-400
    decoration: 'none',
  },
  {
    slug: 'christmas',
    name: 'Christmas',
    description: 'Festive red & evergreen. Falling snowflakes.',
    accent: '220 38 38',          // red-600
    accentForeground: '255 255 255',
    accentDark: '248 113 113',    // red-400
    heroGradient: { from: '254 226 226', to: '220 252 231' }, // red-100 → green-100
    decoration: 'snowflakes',
  },
  {
    slug: 'halloween',
    name: 'Halloween',
    description: 'Pumpkin orange & dusk purple. Crawling spiders.',
    accent: '234 88 12',          // orange-600
    accentForeground: '255 255 255',
    accentDark: '251 146 60',     // orange-400
    heroGradient: { from: '255 237 213', via: '253 230 138', to: '237 233 254' }, // orange-100 → amber-200 → violet-100
    decoration: 'spiders',
  },
  {
    slug: 'easter',
    name: 'Easter',
    description: 'Pastel meadow. Floating eggs.',
    accent: '236 72 153',          // pink-500
    accentForeground: '255 255 255',
    accentDark: '244 114 182',    // pink-400
    heroGradient: { from: '252 231 243', via: '254 240 138', to: '187 247 208' }, // pink-100 → yellow-200 → green-200
    decoration: 'eggs',
  },
  {
    slug: 'valentines',
    name: "Valentine's Day",
    description: 'Romantic rose. Floating hearts.',
    accent: '225 29 72',           // rose-600
    accentForeground: '255 255 255',
    accentDark: '251 113 133',    // rose-400
    heroGradient: { from: '255 228 230', to: '252 231 243' }, // rose-100 → pink-100
    decoration: 'hearts',
  },
  {
    slug: 'summer',
    name: 'Summer',
    description: 'Bright sky & sun-kissed sand. Drifting sparkles.',
    accent: '14 165 233',          // sky-500
    accentForeground: '255 255 255',
    accentDark: '56 189 248',     // sky-400
    heroGradient: { from: '224 242 254', to: '254 249 195' }, // sky-100 → yellow-100
    decoration: 'sparkles',
  },
]

export function getThemeBySlug(slug: string): ThemeDefinition | undefined {
  return BUILTIN_THEMES.find((t) => t.slug === slug)
}

export const DEFAULT_THEME_SLUG = 'default'
