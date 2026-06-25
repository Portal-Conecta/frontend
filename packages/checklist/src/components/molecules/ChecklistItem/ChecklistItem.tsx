'use client'

import { Text } from '@portal/ui'

import { StatusToggle, type StatusValue } from '../../atoms/StatusToggle'

export interface ChecklistItemProps {
  title: string
  description?: string
  value?: StatusValue | null
  defaultValue?: StatusValue | null
  onChange?: (value: StatusValue) => void
  disabled?: boolean
  className?: string
}

export function ChecklistItem({
  title,
  description,
  value,
  defaultValue,
  onChange,
  disabled = false,
  className,
}: ChecklistItemProps) {
  return (
    <div
      className={[
        'flex items-center justify-between gap-4 border-t border-border-default py-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex flex-col gap-2">
        <Text variant="label-md" tone="brand" className='text-[clamp(14px,2vw,16px)]'>
          {title}
        </Text>
        {description && (
          <Text variant="body-sm" tone="secondary" className='font-inter text-[14px]'>
            {description}
          </Text>
        )}
      </div>

    <StatusToggle
        {...(value !== undefined ? { value: value ?? null } : {})}
        defaultValue={defaultValue ?? null}
        onChange={onChange}
        disabled={disabled}
        className="shrink-0"
    />
    </div>
  )
}