// packages/mapa-salas/src/components/MapToolbar/MapToolbar.tsx
//
// Purely presentational: receives the current map mode and exposes the matching
// toolbar actions without knowing about students, seats, drafts, or API calls.

import { Button } from '@portal/ui'

// TODO(#116): replace these local SVGs with the DS Icon after the Front-End
// squad decides whether square-pen, trash, and save should enter the Icon
// registry in packages/ui/src/atoms/Icon/icons.ts.
import { SaveIcon, SquarePenIcon, TrashIcon } from './ToolbarIcons'

export type MapToolbarMode = 'view' | 'edit'

export type MapToolbarProps = {
  /** Current map mode; controls which actions are enabled. */
  mode: MapToolbarMode
  /**
   * Enables "Salvar Alterações" in edit mode. Ignored in view mode.
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

export function MapToolbar({ mode, canSave, onEdit, onClear, onSave, className }: MapToolbarProps) {
  const isEditing = mode === 'edit'

  const containerClasses = [
    'inline-flex h-12 items-center gap-6 rounded-lg border-sm border-border-default bg-background-default px-6 py-3',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClasses}>
      <Button variant="ghost" tone="brand" disabled={isEditing} onClick={onEdit}>
        <SquarePenIcon className={iconSizeClasses} />
        Editar Mapa
      </Button>

      <Button variant="ghost" tone="negative" disabled={!isEditing} onClick={onClear}>
        <TrashIcon className={iconSizeClasses} />
        Limpar Mapa
      </Button>

      <Button variant="ghost" tone="brand" disabled={!isEditing || !canSave} onClick={onSave}>
        <SaveIcon className={iconSizeClasses} />
        Salvar Alterações
      </Button>
    </div>
  )
}
