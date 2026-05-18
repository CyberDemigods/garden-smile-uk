export interface RevenueStats {
  monthlyRevenue: number
  yearlyRevenue: number
  monthlyOrders: number
  yearlyOrders: number
  recentOrders: RecentOrder[]
}

export interface RecentOrder {
  orderNumber: string
  totalAmount: number
  customerName: string
  paidAt: string
}

export interface TaxThreshold {
  label: string
  limit: number
}
