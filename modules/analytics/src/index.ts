import { createModule } from '@demicommerce/core'
import type { DemiModule } from '@demicommerce/core'
import type { TaxThreshold } from './types.ts'

export interface AnalyticsModuleOptions {
  /** Admin view path for revenue stats. Default: '/revenue' */
  adminPath?: string
  /** Tax thresholds for the dashboard progress bars */
  taxThresholds?: TaxThreshold[]
  /** Currency for formatting. Default: 'PLN' */
  currency?: string
}

export function analyticsModule(options?: AnalyticsModuleOptions): DemiModule {
  const adminPath = options?.adminPath ?? '/revenue'

  return createModule({
    slug: 'analytics',
    name: 'Analytics',
    version: '0.1.0',
    dependencies: { orders: '^0.1.0' },
    adminViews: {
      revenue: {
        Component: '@demicommerce/module-analytics/src/components/RevenueStats',
        path: adminPath,
        meta: {
          title: 'Revenue',
          description: 'Revenue statistics and tax thresholds',
        },
      },
    },
  })
}

// Re-export everything for consumers
export type { RevenueStats, RecentOrder, TaxThreshold } from './types.ts'
export { getRevenueStats } from './api/get-revenue-stats.ts'
export { default as RevenueStatsComponent } from './components/RevenueStats'
