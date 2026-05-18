import type { TrustBarBlockData } from '@demicommerce/module-cms'

interface IconProps {
  className?: string
}

const ICON_MAP: Record<string, (props: IconProps) => React.ReactElement> = {
  '🔨': HammerIcon,
  '🚚': TruckIcon,
  '↩': RefundIcon,
  '🔒': LockIcon,
  '🌿': LeafIcon,
  '⭐': StarIcon,
}

export function TrustBarBlock({ block }: { block: TrustBarBlockData }) {
  return (
    <section className="bg-white border-y border-[rgb(var(--gs-leaf-light)/0.25)]">
      <div className="max-w-6xl mx-auto px-6 py-10 md:py-12">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
          {block.items.map((item, i) => {
            const IconComponent = ICON_MAP[item.icon ?? ''] ?? null
            return (
              <li
                key={item.id ?? i}
                className="flex flex-col md:flex-row items-center md:items-start gap-3 text-center md:text-left"
              >
                <span
                  aria-hidden="true"
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-[rgb(var(--gs-leaf-light)/0.15)] text-[rgb(var(--gs-leaf))] flex-shrink-0"
                >
                  {IconComponent ? (
                    <IconComponent className="w-6 h-6" />
                  ) : (
                    <span className="text-2xl">{item.icon ?? '✓'}</span>
                  )}
                </span>
                <span className="text-sm font-medium text-[rgb(var(--gs-leaf-deep))] leading-tight md:pt-2">
                  {item.label}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function HammerIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9" />
      <path d="M17.64 15 22 10.64" />
      <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91" />
    </svg>
  )
}

function TruckIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  )
}

function RefundIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-15-6.7L3 13" />
    </svg>
  )
}

function LockIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function LeafIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3 21 5 14 5.25 9 6.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
    </svg>
  )
}

function StarIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  )
}
