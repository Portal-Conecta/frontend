'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { Icon, type IconName } from '../../atoms/Icon'
import { Text } from '../../atoms/Text'

export type ToastVariant = 'success' | 'error' | 'warning'
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

export interface ToastOptions {
  id?: string
  title?: string
  message: string
  variant?: ToastVariant
  duration?: number
}

export interface ToastItem extends Required<Omit<ToastOptions, 'id' | 'title'>> {
  id: string
  title?: string
}

interface ToastContextValue {
  show: (options: ToastOptions) => string
  dismiss: (id: string) => void
  toast: {
    success: (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) => string
    error: (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) => string
    warning: (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) => string
  }
}

export interface ToastProviderProps {
  children: ReactNode
  position?: ToastPosition
  maxToasts?: number
  defaultDuration?: number
}

export interface ToastProps {
  toast: ToastItem
  onDismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const DEFAULT_DURATION = 5000
const DEFAULT_MAX_TOASTS = 3

const variantClass: Record<ToastVariant, string> = {
  success: 'bg-feedback-success text-text-inverse',
  error: 'bg-feedback-error text-text-inverse',
  warning: 'bg-feedback-warning text-text-primary',
}

const variantIcon: Record<ToastVariant, IconName> = {
  success: 'circle-check',
  error: 'triangle-alert',
  warning: 'triangle-alert',
}

const positionClass: Record<ToastPosition, string> = {
  'top-right': 'left-6 right-6 top-6 sm:left-auto sm:w-full',
  'top-left': 'left-6 right-6 top-6 sm:right-auto sm:w-full',
  'bottom-right': 'bottom-6 left-6 right-6 sm:left-auto sm:w-full',
  'bottom-left': 'bottom-6 left-6 right-6 sm:right-auto sm:w-full',
}

function createToastId() {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <div className="flex min-h-14 w-full overflow-hidden rounded-sm border-sm border-border-default bg-background-surface text-text-primary">
      <div className={`flex w-16 shrink-0 items-center justify-center ${variantClass[toast.variant]}`}>
        <Icon name={variantIcon[toast.variant]} size="lg" decorative />
      </div>

      <div className="flex min-w-0 flex-1 items-center px-5 py-3">
        <Text as="p" variant="label-md-emphasis" tone="primary" className="truncate">
          {toast.title ? `${toast.title}: ${toast.message}` : toast.message}
        </Text>
      </div>

      <div className="flex items-center py-3 pr-3">
        <span className="h-full border-l-sm border-border-default" aria-hidden="true" />
        <button
          type="button"
          className="ml-3 rounded-sm p-1 text-text-primary transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
          aria-label="Fechar notificação"
          onClick={() => onDismiss(toast.id)}
        >
          <Icon name="x" size="md" decorative />
        </button>
      </div>
    </div>
  )
}

export function ToastProvider({
  children,
  position = 'top-right',
  maxToasts = DEFAULT_MAX_TOASTS,
  defaultDuration = DEFAULT_DURATION,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }

    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const show = useCallback(
    ({ id = createToastId(), title, message, variant = 'success', duration = defaultDuration }: ToastOptions) => {
      const nextToast: ToastItem = title
        ? { id, title, message, variant, duration }
        : { id, message, variant, duration }

      setToasts((current) => [nextToast, ...current.filter((toast) => toast.id !== id)].slice(0, maxToasts))

      const previousTimer = timers.current.get(id)
      if (previousTimer) clearTimeout(previousTimer)

      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        )
      }

      return id
    },
    [defaultDuration, dismiss, maxToasts],
  )

  const toast = useMemo(
    () => ({
      success: (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) =>
        show({ ...options, message, variant: 'success' }),
      error: (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) =>
        show({ ...options, message, variant: 'error' }),
      warning: (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) =>
        show({ ...options, message, variant: 'warning' }),
    }),
    [show],
  )

  const value = useMemo(() => ({ show, dismiss, toast }), [dismiss, show, toast])

  useEffect(
    () => () => {
      timers.current.forEach((timer) => clearTimeout(timer))
      timers.current.clear()
    },
    [],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className={`fixed z-50 flex max-w-lg flex-col gap-2 ${positionClass[position]}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((item) => (
          <Toast key={item.id} toast={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider.')
  }

  return context
}
