import { createModule } from '@demicommerce/core'
import type { DemiModule } from '@demicommerce/core'
import { Media } from './collections/Media.ts'

export interface MediaModuleOptions {
  /** Override the default image sizes */
  imageSizes?: Array<{
    name: string
    width: number
    height?: number
    position?: 'centre' | 'top' | 'right top' | 'right' | 'right bottom' | 'bottom' | 'left bottom' | 'left' | 'left top'
  }>
  /** Override allowed MIME types. Defaults to ['image/*'] */
  mimeTypes?: string[]
}

export function mediaModule(_options?: MediaModuleOptions): DemiModule {
  return createModule({
    slug: 'media',
    name: 'Media',
    version: '0.1.0',
    collections: [Media],
  })
}
