import { createModule } from '@demicommerce/core'
import type { DemiModule } from '@demicommerce/core'
import type { CollectionBeforeChangeHook } from 'payload'
import { CustomerGroupsCollection } from './collections/CustomerGroups.ts'
import { validateVatNumber } from './helpers.ts'

export interface B2BModuleOptions {
  /** Validate VAT numbers against VIES on user save. Default: true. */
  enableViesValidation?: boolean
  /** Adds a B2B tab to shop-settings. Default: true. */
  extendShopSettings?: boolean
}

const validateVatOnUserChange: CollectionBeforeChangeHook = async ({ data, originalDoc, operation }) => {
  if (operation !== 'create' && operation !== 'update') return data

  const incoming = (data?.vatNumber as string | undefined)?.trim()
  const previous = (originalDoc as { vatNumber?: string } | undefined)?.vatNumber?.trim()

  if (!incoming) {
    if (data) data.vatNumberValid = false
    return data
  }
  if (incoming === previous && (data?.vatNumberValid !== undefined)) {
    // unchanged — preserve cached validity
    return data
  }

  const result = await validateVatNumber(incoming)
  if (data) data.vatNumberValid = result.valid

  return data
}

export function b2bModule(options: B2BModuleOptions = {}): DemiModule {
  const enableVies = options.enableViesValidation ?? true
  const extendShopSettings = options.extendShopSettings ?? true

  return createModule({
    slug: 'b2b',
    name: 'B2B',
    version: '0.1.0',
    dependencies: { users: '^0.1.0' },
    collections: [CustomerGroupsCollection],
    extendCollections: {
      users: {
        fields: [
          {
            type: 'tabs',
            tabs: [
              {
                label: 'Company',
                description: 'Set when this user represents a business buyer.',
                fields: [
                  {
                    name: 'customerGroup',
                    type: 'relationship',
                    relationTo: 'customer-groups' as never,
                    label: 'Customer group',
                    admin: {
                      description:
                        'Determines pricing and tax rules. Leave empty to use the default group.',
                    },
                  },
                  {
                    name: 'companyName',
                    type: 'text',
                    label: 'Company name',
                  },
                  {
                    name: 'vatNumber',
                    type: 'text',
                    label: 'VAT number',
                    admin: {
                      description:
                        'EU VAT format (e.g. DE123456789). Validated against VIES on save when enabled.',
                    },
                  },
                  {
                    name: 'vatNumberValid',
                    type: 'checkbox',
                    defaultValue: false,
                    label: 'VAT number validated',
                    admin: {
                      readOnly: true,
                      description: 'Set automatically by VIES validation hook.',
                    },
                  },
                  {
                    name: 'taxExempt',
                    type: 'checkbox',
                    label: 'Tax-exempt (override)',
                    admin: {
                      description:
                        'Per-user override. When unset, falls back to the customer group default.',
                    },
                  },
                ],
              },
            ],
          },
        ],
        ...(enableVies
          ? {
              hooks: {
                beforeChange: [validateVatOnUserChange],
              },
            }
          : {}),
      },
    },
    extendGlobals: extendShopSettings
      ? {
          'shop-settings': {
            fields: [
              {
                type: 'tabs',
                tabs: [
                  {
                    label: 'B2B',
                    fields: [
                      {
                        name: 'b2bEnabled',
                        type: 'checkbox',
                        label: 'Enable B2B features',
                        defaultValue: true,
                      },
                      {
                        name: 'b2bDefaultCustomerGroupSlug',
                        type: 'text',
                        label: 'Default customer group slug',
                        admin: {
                          description:
                            'Storefront falls back to this group when a user has no group assigned. The actual default group is whichever has isDefault=true; this is a soft hint.',
                        },
                      },
                      {
                        name: 'b2bViesValidationEnabled',
                        type: 'checkbox',
                        label: 'VIES validation enabled',
                        defaultValue: enableVies,
                        admin: {
                          description:
                            'When off, VAT numbers are stored as-is without VIES check. Useful for non-EU shops.',
                        },
                      },
                      {
                        name: 'b2bGlobalNetPricing',
                        type: 'checkbox',
                        label: 'Show net prices to all B2B groups',
                        defaultValue: true,
                        admin: {
                          description:
                            'Storefront-side toggle. Affects only groups whose own netPricing is unset; per-group setting wins.',
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        }
      : undefined,
  })
}

export { CustomerGroupsCollection } from './collections/CustomerGroups.ts'
export {
  applyGroupDiscount,
  getPriceForUser,
  getDefaultGroup,
  getGroupBySlug,
  getEffectiveTaxExempt,
  validateVatNumber,
} from './helpers.ts'
export type {
  CustomerGroupLite,
  UserB2BProfile,
  PriceForUser,
  VatValidationResult,
} from './helpers.ts'
