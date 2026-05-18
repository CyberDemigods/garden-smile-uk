import type { HomeBlockData } from '@demicommerce/module-cms'
import { HeroBlock } from './blocks/HeroBlock'
import { TrustBarBlock } from './blocks/TrustBarBlock'
import { FeaturedProductsBlock } from './blocks/FeaturedProductsBlock'
import { CategoryTilesBlock } from './blocks/CategoryTilesBlock'
import { RichTextBlock } from './blocks/RichTextBlock'

export function HomeBlocks({ blocks }: { blocks: HomeBlockData[] | undefined }) {
  if (!blocks || blocks.length === 0) return null

  return (
    <>
      {blocks.map((block) => {
        const key = block.id ?? `${block.blockType}-${block.blockName ?? 'block'}`
        switch (block.blockType) {
          case 'hero':
            return <HeroBlock key={key} block={block} />
          case 'trust-bar':
            return <TrustBarBlock key={key} block={block} />
          case 'featured-products':
            return <FeaturedProductsBlock key={key} block={block} />
          case 'category-tiles':
            return <CategoryTilesBlock key={key} block={block} />
          case 'rich-text':
            return <RichTextBlock key={key} block={block} />
          default:
            return null
        }
      })}
    </>
  )
}
