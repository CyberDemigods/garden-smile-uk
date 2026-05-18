export { HeroBlock } from './hero.ts'
export { TrustBarBlock } from './trust-bar.ts'
export { FeaturedProductsBlock } from './featured-products.ts'
export { CategoryTilesBlock } from './category-tiles.ts'
export { RichTextBlock } from './rich-text.ts'

import { HeroBlock } from './hero.ts'
import { TrustBarBlock } from './trust-bar.ts'
import { FeaturedProductsBlock } from './featured-products.ts'
import { CategoryTilesBlock } from './category-tiles.ts'
import { RichTextBlock } from './rich-text.ts'

/** All built-in home page blocks. Apps can extend this list with custom blocks. */
export const HOME_PAGE_BLOCKS = [
  HeroBlock,
  TrustBarBlock,
  FeaturedProductsBlock,
  CategoryTilesBlock,
  RichTextBlock,
]

/**
 * Discriminated union of block payloads as they come back from Payload's API.
 * Apps can narrow on `blockType` and render the right component.
 */
export type HomeBlockData =
  | HeroBlockData
  | TrustBarBlockData
  | FeaturedProductsBlockData
  | CategoryTilesBlockData
  | RichTextBlockData

export interface HeroBlockData {
  blockType: 'hero'
  blockName?: string
  id?: string
  eyebrow?: string
  heading: string
  headingAccent?: string
  subheading?: string
  image?: { url?: string; alt?: string } | null
  primaryCta?: { label?: string; href?: string }
  secondaryCta?: { label?: string; href?: string }
}

export interface TrustBarBlockData {
  blockType: 'trust-bar'
  blockName?: string
  id?: string
  items: Array<{ id?: string; icon?: string; label: string }>
}

export interface FeaturedProductsBlockData {
  blockType: 'featured-products'
  blockName?: string
  id?: string
  eyebrow?: string
  heading: string
  products: Array<unknown>
  viewAllHref?: string
}

export interface CategoryTilesBlockData {
  blockType: 'category-tiles'
  blockName?: string
  id?: string
  eyebrow?: string
  heading: string
  categories: Array<unknown>
  columns?: '2' | '3' | '4'
}

export interface RichTextBlockData {
  blockType: 'rich-text'
  blockName?: string
  id?: string
  maxWidth?: 'prose' | 'wide' | 'full'
  content: unknown
}
