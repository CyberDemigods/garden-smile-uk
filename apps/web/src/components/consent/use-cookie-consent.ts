'use client'

import { useSyncExternalStore } from 'react'

export interface CookieConsentState {
  /** When the user made the choice. ISO timestamp. Null = not chosen yet. */
  decidedAt: string | null
  /** Always required, kept for shape consistency. */
  necessary: true
  analytics: boolean
  marketing: boolean
}

const STORAGE_KEY = 'gs-cookie-consent'
const EVENT = 'gs-cookie-consent-changed'

const DEFAULT: CookieConsentState = {
  decidedAt: null,
  necessary: true,
  analytics: false,
  marketing: false,
}

function save(next: Omit<CookieConsentState, 'necessary' | 'decidedAt'>) {
  const payload: CookieConsentState = {
    ...next,
    necessary: true,
    decidedAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  window.dispatchEvent(new Event(EVENT))
}

function subscribe(listener: () => void) {
  const handler = () => listener()
  window.addEventListener(EVENT, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(EVENT, handler)
    window.removeEventListener('storage', handler)
  }
}

function getSnapshot(): string {
  if (typeof window === 'undefined') return JSON.stringify(DEFAULT)
  return localStorage.getItem(STORAGE_KEY) ?? JSON.stringify(DEFAULT)
}

function getServerSnapshot(): string {
  return JSON.stringify(DEFAULT)
}

export function useCookieConsent() {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const state: CookieConsentState = (() => {
    try {
      return { ...DEFAULT, ...(JSON.parse(stored) as Partial<CookieConsentState>), necessary: true }
    } catch {
      return DEFAULT
    }
  })()

  return {
    state,
    decided: !!state.decidedAt,
    acceptAll: () => save({ analytics: true, marketing: true }),
    rejectAll: () => save({ analytics: false, marketing: false }),
    save: (prefs: { analytics: boolean; marketing: boolean }) => save(prefs),
    /** Re-open the banner — wipes the stored decision so the banner shows again. */
    reset: () => {
      localStorage.removeItem(STORAGE_KEY)
      window.dispatchEvent(new Event(EVENT))
    },
  }
}
