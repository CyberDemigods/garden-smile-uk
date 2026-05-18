'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useCookieConsent } from './use-cookie-consent'

export function CookieConsent() {
  const { state, decided, acceptAll, rejectAll, save } = useCookieConsent()
  const [mounted, setMounted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [analytics, setAnalytics] = useState(state.analytics)
  const [marketing, setMarketing] = useState(state.marketing)

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    setAnalytics(state.analytics)
    setMarketing(state.marketing)
  }, [state.analytics, state.marketing])

  if (!mounted || decided) return null

  const banner = (
    <>
      <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-6 md:left-auto md:right-6 md:max-w-md z-40 bg-white rounded-2xl shadow-2xl border border-[rgb(var(--gs-leaf-light)/0.4)] p-5">
        <h3 className="font-serif text-lg text-[rgb(var(--gs-leaf-deep))] mb-2">
          Cookies on Garden Smile
        </h3>
        <p className="text-sm text-[rgb(var(--gs-stone))] mb-4">
          We use cookies to keep the cart working, measure how the site performs, and
          show you relevant ads. Necessary cookies are always on.
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={acceptAll}
            className="w-full px-4 py-2 rounded-full bg-[rgb(var(--gs-leaf))] text-white text-sm font-medium hover:bg-[rgb(var(--gs-leaf-deep))] transition"
          >
            Accept all
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={rejectAll}
              className="flex-1 px-4 py-2 rounded-full border border-[rgb(var(--gs-leaf-light)/0.5)] text-[rgb(var(--gs-stone))] text-sm hover:bg-[rgb(var(--gs-leaf-light)/0.12)] transition"
            >
              Reject all
            </button>
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="flex-1 px-4 py-2 rounded-full border border-[rgb(var(--gs-leaf-light)/0.5)] text-[rgb(var(--gs-stone))] text-sm hover:bg-[rgb(var(--gs-leaf-light)/0.12)] transition"
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {showSettings && (
        <div
          aria-modal="true"
          role="dialog"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgb(var(--gs-leaf-deep)/0.55)] backdrop-blur-sm"
        >
          <div className="bg-[rgb(var(--gs-cream))] rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-2xl text-[rgb(var(--gs-leaf-deep))] mb-2">
              Cookie preferences
            </h3>
            <p className="text-sm text-[rgb(var(--gs-stone))] mb-6">
              Choose which categories of cookies you want to allow.
            </p>

            <div className="space-y-4 mb-6">
              <CategoryRow
                title="Strictly necessary"
                description="Required for the cart, checkout, and login. Always on."
                checked={true}
                disabled
              />
              <CategoryRow
                title="Analytics"
                description="Anonymous usage data so we know what works and what doesn't."
                checked={analytics}
                onChange={setAnalytics}
              />
              <CategoryRow
                title="Marketing"
                description="Personalised ads on Google, Facebook and Instagram."
                checked={marketing}
                onChange={setMarketing}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  save({ analytics, marketing })
                  setShowSettings(false)
                }}
                className="flex-1 px-4 py-3 rounded-full bg-[rgb(var(--gs-leaf))] text-white text-sm font-medium hover:bg-[rgb(var(--gs-leaf-deep))] transition"
              >
                Save preferences
              </button>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="px-4 py-3 rounded-full border border-[rgb(var(--gs-leaf-light)/0.5)] text-[rgb(var(--gs-stone))] text-sm hover:bg-[rgb(var(--gs-leaf-light)/0.12)] transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )

  return createPortal(banner, document.body)
}

interface CategoryRowProps {
  title: string
  description: string
  checked: boolean
  onChange?: (next: boolean) => void
  disabled?: boolean
}

function CategoryRow({ title, description, checked, onChange, disabled }: CategoryRowProps) {
  return (
    <label
      className={`flex items-start gap-3 p-3 rounded-xl border ${
        disabled ? 'border-[rgb(var(--gs-leaf-light)/0.2)] opacity-70' : 'border-[rgb(var(--gs-leaf-light)/0.4)] cursor-pointer hover:bg-white/60'
      } transition`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-0.5 w-4 h-4 accent-[rgb(var(--gs-leaf))]"
      />
      <div>
        <div className="font-medium text-[rgb(var(--gs-leaf-deep))]">{title}</div>
        <div className="text-xs text-[rgb(var(--gs-stone))] mt-0.5">{description}</div>
      </div>
    </label>
  )
}
