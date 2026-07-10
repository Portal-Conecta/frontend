import { Button, type ButtonTone, type ButtonVariant, type IconName } from '@portal/ui'

export type AnnouncementActionsMenuVariant = 'outlined' | 'solid'
export type AnnouncementActionsMenuAction = 'pin' | 'edit' | 'delete'

export interface AnnouncementActionsMenuProps {
  /** O comunicado já está fixado? Troca o primeiro botão entre Fixar/Desafixar. */
  pinned: boolean
  onPin: () => void
  onEdit: () => void
  onDelete: () => void
  /**
   * `outlined` (padrão) — cards em fundo branco (`Card - comunicado` no Figma).
   * `solid` — cards com gradiente/fixados no topo do mural (`Card - fixado`).
   */
  variant?: AnnouncementActionsMenuVariant
  /** Modo compacto (mobile): só ícone, sem rótulo. */
  compact?: boolean
  /** Ação em andamento — desabilita os outros botões e mostra spinner no ativo. */
  pending?: AnnouncementActionsMenuAction | null
  className?: string
}

const outlinedTone: Record<AnnouncementActionsMenuAction, ButtonTone> = {
  pin: 'brand',
  edit: 'brand',
  delete: 'negative',
}

/** Modo compacto vira icon-only (`icon` + `aria-label`); padrão mostra ícone + rótulo. */
function labelProps(icon: IconName, label: string, compact: boolean) {
  return compact ? { icon, 'aria-label': label } : { iconLeft: icon, children: label }
}

export function AnnouncementActionsMenu({
  pinned,
  onPin,
  onEdit,
  onDelete,
  variant = 'outlined',
  compact = false,
  pending = null,
  className,
}: AnnouncementActionsMenuProps) {
  const buttonVariant: ButtonVariant = variant === 'solid' ? 'solid' : 'outlined'
  const tone = (action: AnnouncementActionsMenuAction): ButtonTone =>
    variant === 'solid' ? 'brand' : outlinedTone[action]

  const classes = ['flex items-start gap-2', className].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <Button
        variant={buttonVariant}
        tone={tone('pin')}
        loading={pending === 'pin'}
        disabled={pending != null && pending !== 'pin'}
        onClick={onPin}
        {...labelProps(pinned ? 'pin-off' : 'pin', pinned ? 'Desafixar' : 'Fixar', compact)}
      />
      <Button
        variant={buttonVariant}
        tone={tone('edit')}
        loading={pending === 'edit'}
        disabled={pending != null && pending !== 'edit'}
        onClick={onEdit}
        {...labelProps('square-pen', 'Editar', compact)}
      />
      <Button
        variant={buttonVariant}
        tone={tone('delete')}
        loading={pending === 'delete'}
        disabled={pending != null && pending !== 'delete'}
        onClick={onDelete}
        {...labelProps('trash-2', 'Excluir', compact)}
      />
    </div>
  )
}
