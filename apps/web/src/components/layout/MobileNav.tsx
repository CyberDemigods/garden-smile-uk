'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'

interface NavLink {
  href: string
  label: string
}

export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-[rgb(var(--gs-leaf-deep))] hover:bg-[rgb(var(--gs-leaf-light)/0.18)] transition-colors"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      {mounted && open &&
        createPortal(
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <aside
              className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-[rgb(var(--gs-cream))] shadow-xl flex flex-col"
              role="dialog"
              aria-label="Navigation menu"
            >
              <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--gs-leaf-light)/0.25)]">
                <span className="font-serif text-xl text-[rgb(var(--gs-leaf-deep))]">Menu</span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="w-10 h-10 inline-flex items-center justify-center rounded-full text-[rgb(var(--gs-leaf-deep))] hover:bg-[rgb(var(--gs-leaf-light)/0.18)]"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                  </svg>
                </button>
              </div>
              <nav className="flex flex-col p-6 gap-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="px-3 py-3 rounded-xl text-base font-medium text-[rgb(var(--gs-stone))] hover:bg-[rgb(var(--gs-leaf-light)/0.18)] hover:text-[rgb(var(--gs-leaf-deep))] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </aside>
          </div>,
          document.body,
        )}
    </>
  )
}
