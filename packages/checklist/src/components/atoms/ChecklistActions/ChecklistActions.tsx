import { Button } from '@portal/ui'
export interface ChecklistActionsProps {
  mode?: 'submit' | 'edit'
  onSubmit: () => void
  onEdit?: () => void
  isSubmitDisabled?: boolean
  isSubmitting?: boolean
}

export function ChecklistActions({
  mode = 'submit',
  onSubmit,
  onEdit,
  isSubmitDisabled = false,
  isSubmitting = false,
}: ChecklistActionsProps) {
  if (mode === 'edit') {
    return (
      <Button iconLeft="square-pen" onClick={onEdit} className="font-semibold text-base">
        Editar Checklist
      </Button>
    )
  }

  return (
    <Button
      iconLeft="check-check"
      onClick={onSubmit}
      disabled={isSubmitDisabled}
      loading={isSubmitting}
      className="font-semibold text-base"
    >
      Enviar Checklist
    </Button>
  )
}