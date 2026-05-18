import type { GlobalConfig } from 'payload'
import { HOME_PAGE_BLOCKS } from '../blocks/index.ts'

export const HomePageGlobal: GlobalConfig = {
  slug: 'home-page',
  label: 'Home page',
  admin: {
    description:
      'Modular home page. Drag blocks to reorder, click into a block to edit, save to publish. Localized — switch language in the top bar.',
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'blocks',
      type: 'blocks',
      label: 'Sections',
      blocks: HOME_PAGE_BLOCKS,
      localized: true,
      admin: {
        description: 'Build the home page from these sections. The order here is the order on the page.',
      },
    },
  ],
}
