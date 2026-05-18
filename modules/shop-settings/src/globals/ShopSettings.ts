import type { GlobalConfig, Tab } from 'payload'

export interface ShopSettingsGlobalOptions {
  /** Additional tabs to add to the settings global */
  extraTabs?: Tab[]
  /** Currency options. Defaults to PLN, EUR, USD */
  currencies?: Array<{ label: string; value: string }>
  /** Default currency. Defaults to 'PLN' */
  defaultCurrency?: string
  /** Shipping provider options shown on each shipping method. Omit to hide the provider field. */
  shippingProviders?: Array<{ label: string; value: string }>
  /** Enable Click & Collect points configuration. Default: false */
  enableCollectPoints?: boolean
  /** Enable VAT rate and "prices include VAT" fields. Default: false */
  enableVat?: boolean
  /** Default VAT rate (%). Default: 20 */
  defaultVatRate?: number
  /** Default country for shipping address. Default: 'Poland' */
  defaultCountry?: string
}

export function createShopSettingsGlobal(options: ShopSettingsGlobalOptions): GlobalConfig {
  const currencies = options.currencies ?? [
    { label: 'PLN (zloty)', value: 'PLN' },
    { label: 'EUR (euro)', value: 'EUR' },
    { label: 'USD (dollar)', value: 'USD' },
  ]

  const tabs: Tab[] = [
    {
      label: 'General',
      fields: [
        {
          name: 'shopName',
          type: 'text',
          label: 'Shop name',
          required: true,
          defaultValue: 'DemiShop',
          localized: true,
        },
        {
          name: 'shopDescription',
          type: 'textarea',
          label: 'Shop description',
          localized: true,
        },
        {
          name: 'footerDescription',
          type: 'textarea',
          label: 'Footer description',
          localized: true,
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          label: 'Logo',
        },
        {
          name: 'contactEmail',
          type: 'email',
          label: 'Contact email',
          required: true,
        },
      ],
    },
    {
      label: 'Shipping',
      fields: [
        {
          name: 'shippingMethods',
          type: 'array',
          label: 'Shipping methods',
          fields: [
            {
              name: 'methodId',
              type: 'text',
              label: 'Method ID (slug)',
              required: true,
            },
            ...(options.shippingProviders
              ? [
                  {
                    name: 'provider' as const,
                    type: 'select' as const,
                    label: 'Provider',
                    required: true,
                    defaultValue: options.shippingProviders[options.shippingProviders.length - 1]?.value ?? 'other',
                    options: options.shippingProviders,
                  },
                ]
              : []),
            {
              name: 'name',
              type: 'text',
              label: 'Name',
              required: true,
              localized: true,
            },
            {
              name: 'price',
              type: 'number',
              label: 'Price',
              required: true,
              admin: { step: 0.01 },
            },
            {
              name: 'estimatedTime',
              type: 'text',
              label: 'Estimated delivery time',
              required: true,
              localized: true,
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Description (optional)',
              localized: true,
            },
            {
              name: 'active',
              type: 'checkbox',
              label: 'Active',
              defaultValue: true,
            },
          ],
        },
        {
          name: 'freeShippingThreshold',
          type: 'number',
          label: 'Free shipping threshold',
          admin: {
            description: 'Leave empty to disable free shipping',
            step: 0.01,
          },
        },
        ...(options.enableCollectPoints
          ? [
              {
                name: 'collectPoints' as const,
                type: 'array' as const,
                label: 'Collection points (Click & Collect)',
                admin: {
                  description: 'Available pickup locations for Click & Collect shipping.',
                },
                fields: [
                  { name: 'name' as const, type: 'text' as const, label: 'Location name', required: true, localized: true },
                  { name: 'address' as const, type: 'text' as const, label: 'Address', required: true },
                  { name: 'city' as const, type: 'text' as const, label: 'City', required: true },
                  { name: 'postalCode' as const, type: 'text' as const, label: 'Postcode', required: true },
                  { name: 'openingHours' as const, type: 'text' as const, label: 'Opening hours', localized: true },
                  { name: 'active' as const, type: 'checkbox' as const, label: 'Active', defaultValue: true },
                ],
              },
            ]
          : []),
        {
          name: 'shippingInfo',
          type: 'richText',
          label: 'Shipping information',
          localized: true,
        },
      ],
    },
    {
      label: 'Contact info',
      fields: [
        {
          name: 'contactAddress',
          type: 'textarea',
          label: 'Address',
          localized: true,
          admin: {
            description: 'Multi-line postal address shown on the Contact page.',
          },
        },
        {
          name: 'contactPhone',
          type: 'text',
          label: 'Phone',
        },
        {
          name: 'openingHours',
          type: 'textarea',
          label: 'Opening hours',
          localized: true,
          admin: {
            description: 'One line per day, e.g. "Mon-Fri 9:00-17:00".',
          },
        },
        {
          name: 'mapEmbedUrl',
          type: 'text',
          label: 'Map embed URL',
          admin: {
            description:
              'Iframe src for an embedded map (Google Maps / OpenStreetMap). Leave empty to hide the map.',
          },
        },
      ],
    },
    {
      label: 'Social Media',
      fields: [
        {
          name: 'socialLinks',
          type: 'group',
          fields: [
            { name: 'instagram', type: 'text', label: 'Instagram URL' },
            { name: 'facebook', type: 'text', label: 'Facebook URL' },
            { name: 'youtube', type: 'text', label: 'YouTube URL' },
            { name: 'tiktok', type: 'text', label: 'TikTok URL' },
          ],
        },
      ],
    },
    {
      label: options.enableVat ? 'Currency & Tax' : 'Currency',
      fields: [
        {
          name: 'currency',
          type: 'select',
          label: 'Currency',
          defaultValue: options.defaultCurrency ?? 'PLN',
          options: currencies,
        },
        ...(options.enableVat
          ? [
              {
                name: 'vatRate' as const,
                type: 'number' as const,
                label: 'VAT rate (%)',
                defaultValue: options.defaultVatRate ?? 20,
                min: 0,
                max: 100,
                admin: {
                  step: 0.1,
                  description: 'Standard VAT rate. Set to 0 to disable VAT display.',
                },
              },
              {
                name: 'pricesIncludeVat' as const,
                type: 'checkbox' as const,
                label: 'Prices include VAT',
                defaultValue: true,
                admin: {
                  description: 'When checked, displayed prices already include VAT.',
                },
              },
            ]
          : []),
      ],
    },
  ]

  // Append extra tabs from module options
  if (options.extraTabs) {
    tabs.push(...options.extraTabs)
  }

  return {
    slug: 'shop-settings',
    label: 'Shop Settings',
    admin: {
      group: 'System',
    },
    access: {
      read: () => true,
    },
    fields: [
      {
        type: 'tabs',
        tabs,
      },
    ],
  }
}
