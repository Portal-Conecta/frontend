'use client'

import { Text } from '@portal/ui'
import { useState } from 'react'

import { StatusToggle, type StatusValue } from '../../atoms/StatusToggle'

export interface ChecklistItemProps {
  title: string
  description?: string
  value?: StatusValue | null
  defaultValue?: StatusValue | null
  onChange?: (value: StatusValue) => void
  justification?: string
  onJustificationChange?: (text: string) => void
  disabled?: boolean
  className?: string
}

export function ChecklistItem({
  title,
  description,
  value,
  defaultValue,
  onChange,
  justification,
  onJustificationChange,
  disabled = false,
  className,
}: ChecklistItemProps) {
  const isControlled = value !== undefined
  const [internalStatus, setInternalStatus] = useState<StatusValue | null>(defaultValue ?? null)
  const selected = isControlled ? value : internalStatus

  const isJustificationControlled = justification !== undefined
  const [internalJustification, setInternalJustification] = useState('')
  const justificationValue = isJustificationControlled ? justification : internalJustification

  const handleStatusChange = (next: StatusValue) => {
    if (!isControlled) setInternalStatus(next)
    onChange?.(next)
  }

  const handleJustificationChange = (text: string) => {
    if (!isJustificationControlled) setInternalJustification(text)
    onJustificationChange?.(text)
  }

  const showJustification = selected === 'nao-conforme'

  return (
    <div className={['border-t border-border-default py-3', className].filter(Boolean).join(' ')}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-0" style={{ maxWidth: 'clamp(200px, 60vw, 1024px)' }}>
          <Text variant="label-md" tone="brand" className="text-[clamp(14px,2vw,16px)]">
            {title}
          </Text>
          {description && (
            <Text
              variant="body-sm"
              tone="secondary"
              className={[
                'font-inter text-[14px] break-words',
                showJustification ? 'hidden md:block' : '',
              ].join(' ')}
            >
              {description}
            </Text>
          )}
        </div>

        <StatusToggle
          {...(value !== undefined ? { value: value ?? null } : {})}
          defaultValue={defaultValue ?? null}
          onChange={handleStatusChange}
          disabled={disabled}
          className="shrink-0 ml-8"
        />
      </div>

      {showJustification && (
        <div className="mt-3">
          <textarea
            placeholder="Descreva o problema"
            value={justificationValue}
            onChange={(e) => handleJustificationChange(e.target.value)}
            disabled={disabled}
            style={{ height: '103px' }}
            className={[
              'w-full resize-none rounded-md border-sm border-border-default bg-background-surface',
              'px-3 py-[10px] font-inter text-label-md text-text-primary',
              'placeholder:text-text-placeholder outline-none',
              'focus:border-border-focus transition-colors',
              'md:!h-12',
              disabled ? 'cursor-not-allowed text-text-disabled border-border-disabled' : '',
            ].join(' ')}
          />
        </div>
      )}
    </div>
  )
}