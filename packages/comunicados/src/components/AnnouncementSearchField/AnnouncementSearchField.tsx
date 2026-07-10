'use client'

import { Icon } from '@portal/ui'

export interface AnnouncementSearchFieldProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
}

export function AnnouncementSearchField({
  value,
  onChange,
  readOnly = false,
}: AnnouncementSearchFieldProps) {
  return (
    <label className="block">
      <span className="sr-only">Buscar comunicados</span>
      <span className="flex w-full items-center gap-2 rounded-md border-sm border-border-default bg-background-surface px-4 py-2 focus-within:border-border-focus focus-within:ring-2 focus-within:ring-border-focus">
        <Icon name="search" size="sm" tone="primary" decorative />
        <input
          type="search"
          value={value}
          readOnly={readOnly}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 font-inter text-body-md text-text-primary outline-none placeholder:text-text-placeholder"
        />
      </span>
    </label>
  )
}
