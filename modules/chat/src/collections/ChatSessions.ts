import type { CollectionConfig } from 'payload'

export function createChatSessionsCollection(): CollectionConfig {
  return {
    slug: 'chat-sessions',
    admin: {
      useAsTitle: 'visitorName',
      description: 'Live chat conversations',
      defaultColumns: ['visitorName', 'visitorEmail', 'status', 'lastMessageAt', 'createdAt'],
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
        name: 'visitorId',
        type: 'text',
        label: 'Visitor ID',
        required: true,
        index: true,
        admin: { readOnly: true },
      },
      {
        name: 'visitorName',
        type: 'text',
        label: 'Visitor name',
      },
      {
        name: 'visitorEmail',
        type: 'email',
        label: 'Visitor email',
      },
      {
        name: 'status',
        type: 'select',
        label: 'Status',
        defaultValue: 'open',
        required: true,
        options: [
          { label: 'Open', value: 'open' },
          { label: 'Closed', value: 'closed' },
        ],
      },
      {
        name: 'lastMessageAt',
        type: 'date',
        label: 'Last message',
        admin: {
          readOnly: true,
          date: { pickerAppearance: 'dayAndTime' },
        },
      },
    ],
  }
}
