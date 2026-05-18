import type { CollectionConfig } from 'payload'

export function createChatMessagesCollection(): CollectionConfig {
  return {
    slug: 'chat-messages',
    admin: {
      useAsTitle: 'text',
      description: 'Individual chat messages',
      defaultColumns: ['role', 'text', 'createdAt'],
      group: 'Chat',
    },
    access: {
      read: ({ req }) => !!req.user,
      create: () => true,
      update: ({ req }) => !!req.user,
      delete: ({ req }) => {
        const user = req.user as { role?: string } | undefined
        return user?.role === 'admin'
      },
    },
    fields: [
      {
        name: 'session',
        type: 'relationship',
        relationTo: 'chat-sessions',
        required: true,
        index: true,
        admin: { readOnly: true },
      },
      {
        name: 'role',
        type: 'select',
        label: 'Sender',
        required: true,
        options: [
          { label: 'Visitor', value: 'visitor' },
          { label: 'Agent', value: 'agent' },
        ],
      },
      {
        name: 'text',
        type: 'textarea',
        label: 'Message',
        required: true,
      },
    ],
  }
}
