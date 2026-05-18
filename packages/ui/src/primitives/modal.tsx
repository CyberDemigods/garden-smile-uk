'use client'

import * as React from 'react'
import { cn } from '../utils.ts'

export interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  title?: string
}

export function Modal({ open, onClose, children, className, title }: ModalProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={cn(
          'relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl animate-slide-up',
          className,
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-primary-400 hover:text-primary-600 transition-colors"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {title && (
          <h2 id="modal-title" className="mb-4 text-lg font-semibold text-primary-900">
            {title}
          </h2>
        )}

        {children}
      </div>
    </div>
  )
}
