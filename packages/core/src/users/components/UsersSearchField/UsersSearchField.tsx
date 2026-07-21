'use client'

/**
 * UsersSearchField — busca da lista de usuários por nome (#440).
 *
 * Espelha `CourseSearchField`: lupa à esquerda, campo full-width `rounded-lg`
 * com borda focus, sem tocar em `packages/ui`. Debounce vive na página.
 */
import { Icon } from '@portal/ui'

export interface UsersSearchFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
}

export function UsersSearchField({
  value,
  onChange,
  placeholder = 'Buscar por nome',
  className,
  id,
}: UsersSearchFieldProps) {
  return (
    <div
      className={[
        'flex items-center gap-2 rounded-lg border-sm px-6 py-2.5 transition-colors',
        'bg-background-surface border-border-focus focus-within:ring-2 focus-within:ring-border-focus',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="shrink-0 text-text-brand">
        <Icon name="search" size="md" decorative />
      </span>
      <input
        id={id}
        type="search"
        aria-label="Buscar usuários por nome"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-label-md font-inter text-text-primary outline-none placeholder:text-text-placeholder [&::-webkit-search-cancel-button]:appearance-none"
      />
    </div>
  )
}
