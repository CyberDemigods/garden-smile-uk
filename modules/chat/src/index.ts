import { createModule } from '@demicommerce/core'
import type { DemiModule } from '@demicommerce/core'
import { createChatSessionsCollection } from './collections/ChatSessions.ts'
import { createChatMessagesCollection } from './collections/ChatMessages.ts'

export interface ChatModuleOptions {
  _placeholder?: never
}

export function chatModule(_options?: ChatModuleOptions): DemiModule {
  return createModule({
    slug: 'chat',
    name: 'Live Chat',
    version: '0.1.0',
    collections: [
      createChatSessionsCollection(),
      createChatMessagesCollection(),
    ],
    extendGlobals: {
      'shop-settings': {
        fields: [
          {
            type: 'tabs',
            tabs: [
              {
                label: 'Live Chat',
                fields: [
                  {
                    name: 'liveChatEnabled',
                    type: 'checkbox',
                    label: 'Enable live chat widget',
                    defaultValue: false,
                    admin: {
                      description:
                        'Show the chat bubble on the storefront. Visitors can start conversations that appear in Chat > Sessions.',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  })
}
