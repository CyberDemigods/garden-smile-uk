'use client'

import { useEffect, useState } from 'react'
import type { RevenueStats as RevenueStatsType, TaxThreshold } from '../types.ts'

function formatPrice(price: number, currency = 'PLN'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function ProgressBar({
  value,
  max,
  label,
  warning = false,
}: {
  value: number
  max: number
  label: string
  warning?: boolean
}) {
  const percentage = Math.min((value / max) * 100, 100)
  const isNearLimit = percentage > 80

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
        <span>{label}</span>
        <span style={{ fontWeight: isNearLimit && warning ? 'bold' : 'normal', color: isNearLimit && warning ? '#dc2626' : 'inherit' }}>
          {formatPrice(value)} / {formatPrice(max)} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div style={{ height: '16px', width: '100%', overflow: 'hidden', borderRadius: '9999px', backgroundColor: '#e5e7eb' }}>
        <div
          style={{
            height: '100%',
            transition: 'all 0.3s',
            backgroundColor: isNearLimit && warning ? '#ef4444' : percentage > 50 ? '#eab308' : '#22c55e',
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  )
}

export interface RevenueStatsProps {
  /** API endpoint to fetch stats from. Default: '/api/stats/revenue' */
  apiEndpoint?: string
  /** Tax thresholds to display as progress bars */
  taxThresholds?: TaxThreshold[]
  /** Currency code for formatting. Default: 'PLN' */
  currency?: string
}

export default function RevenueStats({
  apiEndpoint = '/api/stats/revenue',
  taxThresholds = [],
  currency = 'PLN',
}: RevenueStatsProps) {
  const [stats, setStats] = useState<RevenueStatsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(apiEndpoint)
        if (!res.ok) throw new Error('Failed to fetch stats')
        const data = (await res.json()) as RevenueStatsType
        setStats(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    void fetchStats()
  }, [apiEndpoint])

  if (loading) {
    return <div style={{ padding: '24px' }}><p style={{ color: '#6b7280' }}>Loading stats...</p></div>
  }

  if (error) {
    return <div style={{ padding: '24px' }}><p style={{ color: '#ef4444' }}>Error: {error}</p></div>
  }

  if (!stats) return null

  const fmt = (n: number) => formatPrice(n, currency)

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Revenue Statistics</h2>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', backgroundColor: 'white' }}>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Monthly revenue</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{fmt(stats.monthlyRevenue)}</p>
          <p style={{ fontSize: '14px', color: '#9ca3af' }}>{stats.monthlyOrders} orders</p>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', backgroundColor: 'white' }}>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Yearly revenue</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{fmt(stats.yearlyRevenue)}</p>
          <p style={{ fontSize: '14px', color: '#9ca3af' }}>{stats.yearlyOrders} orders</p>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', backgroundColor: 'white' }}>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Avg order value</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {stats.yearlyOrders > 0 ? fmt(stats.yearlyRevenue / stats.yearlyOrders) : fmt(0)}
          </p>
        </div>
      </div>

      {/* Tax thresholds */}
      {taxThresholds.length > 0 && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px', backgroundColor: 'white', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Tax thresholds ({new Date().getFullYear()})
          </h3>
          {taxThresholds.map((threshold) => (
            <ProgressBar
              key={threshold.label}
              value={stats.yearlyRevenue}
              max={threshold.limit}
              label={threshold.label}
              warning
            />
          ))}
        </div>
      )}

      {/* Recent orders */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px', backgroundColor: 'white' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Recent paid orders</h3>
        {stats.recentOrders.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No paid orders yet</p>
        ) : (
          <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ paddingBottom: '8px' }}>Order #</th>
                <th style={{ paddingBottom: '8px' }}>Customer</th>
                <th style={{ paddingBottom: '8px' }}>Paid at</th>
                <th style={{ paddingBottom: '8px', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order.orderNumber} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '8px 0', fontFamily: 'monospace' }}>{order.orderNumber}</td>
                  <td style={{ padding: '8px 0' }}>{order.customerName}</td>
                  <td style={{ padding: '8px 0' }}>{formatDate(order.paidAt)}</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 500 }}>{fmt(order.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
