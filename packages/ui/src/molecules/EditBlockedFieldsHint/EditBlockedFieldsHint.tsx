import { Alert } from '../Alert'

export interface EditBlockedFieldsHintProps {
  disabled?: boolean
}

export function EditBlockedFieldsHint({ disabled = false }: EditBlockedFieldsHintProps) {
  if (!disabled) {
    return null
  }

  return (
    <Alert variant="info" className="mt-4">
      Alguns campos ficam bloqueados após a publicação e não podem ser alterados na edição.
    </Alert>
  )
}
