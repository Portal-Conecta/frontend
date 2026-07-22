'use client'

import { Icon } from '@portal/ui'

export interface AnnouncementSearchFieldProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  /** Borda de foco brand (toolbar mobile do mural). */
  emphasizeBorder?: boolean
  /**
   * Altura compacta alinhada ao botão "Filtros" do mural mobile (~28–36px no Figma).
   */
  compact?: boolean
}

export function AnnouncementSearchField({
  value,
  onChange,
  readOnly = false,
  emphasizeBorder = false,
  compact = false,
}: AnnouncementSearchFieldProps) {
  const shellClass = [
    'flex w-full items-center rounded-md border-sm bg-background-surface',
    compact ? 'h-9 gap-2 px-3' : 'gap-2 px-3 py-2',
    'focus-within:ring-2 focus-within:ring-border-focus',
    emphasizeBorder
      ? 'border-interactive-default focus-within:border-interactive-default'
      : 'border-border-default focus-within:border-border-focus',
  ].join(' ')

  return (
    <label className="block h-full w-full min-w-0">
      <span className="sr-only">Buscar comunicados</span>
      <span className={shellClass}>
        <Icon name="search" size="sm" tone="primary" decorative />
        <input
          type="search"
          value={value}
          readOnly={readOnly}
          onChange={(event) => onChange(event.target.value)}
          className={[
            'min-w-0 flex-1 border-0 bg-transparent p-0 text-text-primary outline-none placeholder:text-text-placeholder',
            compact ? 'font-inter text-label-sm' : 'font-inter text-body-md',
          ].join(' ')}
        />
      </span>
    </label>
  )
}
