interface LowStockBadgeProps {
  stock: number | undefined
  /** Threshold below which the badge appears. Default 3. */
  threshold?: number
  className?: string
}

/**
 * Scarcity nudge — only renders when stock is between 1 and threshold.
 * Sold-out (stock === 0) is handled separately by the page UI.
 */
export function LowStockBadge({ stock, threshold = 3, className }: LowStockBadgeProps) {
  if (typeof stock !== 'number' || stock <= 0 || stock > threshold) return null

  return (
    <span
      className={
        className ??
        'inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium'
      }
    >
      <span aria-hidden="true">⏱</span>
      {stock === 1 ? 'Only 1 left' : `Only ${stock} left`}
    </span>
  )
}
