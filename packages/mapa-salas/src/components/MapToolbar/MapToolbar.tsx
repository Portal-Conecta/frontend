// packages/mapa-salas/src/components/MapToolbar/MapToolbar.tsx
//
// Purely presentational: receives the current map mode and exposes the matching
// toolbar actions without knowing about students, seats, drafts, or API calls.

import type { ReactNode } from 'react'

// TODO(#116): replace these local SVGs with the DS Icon once square-pen, trash,
// and save are approved in packages/ui/src/atoms/Icon/icons.ts.
import { SaveIcon, SquarePenIcon, TrashIcon } from './ToolbarIcons'

export type MapToolbarMode = 'view' | 'edit'

export type MapToolbarProps = {
  /** Current map mode; controls which actions are visible. */
  mode: MapToolbarMode
  /**
   * Enables "Salvar Alteracoes" in edit mode. Ignored in view mode.
   */
  canSave: boolean
  /** Switches the map to edit mode. */
  onEdit: () => void
  /** Opens the clear-map confirmation flow. */
  onClear: () => void
  /** Triggers the save flow. */
  onSave: () => void
  className?: string
}

const iconSizeClasses = 'h-6 w-6'

const actionBaseClasses =
  'inline-flex h-6 items-center gap-3 bg-transparent p-0 text-label-md font-afacad transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:text-text-disabled ' +
  '[-webkit-tap-highlight-color:transparent]'

type ToolbarActionProps = {
  children: ReactNode
  tone: 'brand' | 'negative'
  disabled?: boolean
  onClick: () => void
}

function ToolbarAction({ children, tone, disabled = false, onClick }: ToolbarActionProps) {
  const toneClasses =
    tone === 'negative'
      ? 'text-interactive-negative-default hover:text-interactive-negative-default active:text-interactive-negative-default'
      : 'text-interactive-default hover:text-interactive-default active:text-interactive-default'

  return (
    <button
      type="button"
      className={`${actionBaseClasses} ${toneClasses}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function MapToolbar({ mode, canSave, onEdit, onClear, onSave, className }: MapToolbarProps) {
  const containerClasses = [
    'inline-flex h-12 items-center gap-6 rounded-lg border-sm border-border-default bg-background-default px-6 py-3',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (mode === 'view') {
    return (
      <div className={containerClasses}>
        <ToolbarAction tone="brand" onClick={onEdit}>
          <SquarePenIcon className={iconSizeClasses} />
          Editar Mapa
        </ToolbarAction>
      </div>
    )
  }

  return (
    <div className={containerClasses}>
      <ToolbarAction tone="negative" onClick={onClear}>
        <TrashIcon className={iconSizeClasses} />
        Limpar Mapa
      </ToolbarAction>

      <ToolbarAction tone="brand" disabled={!canSave} onClick={onSave}>
        <SaveIcon className={iconSizeClasses} />
        Salvar Alterações
      </ToolbarAction>
    </div>
  )
}
