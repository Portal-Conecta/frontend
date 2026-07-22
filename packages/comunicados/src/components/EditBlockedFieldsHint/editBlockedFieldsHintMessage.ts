export const EDIT_BLOCKED_FIELDS_HINT_MESSAGE =
  'Alguns campos ficam bloqueados após a publicação e não podem ser alterados na edição. Não é possível agendar um comunicado já publicado.' as const

export function shouldShowEditBlockedFieldsHint(blocked?: boolean): boolean {
  return Boolean(blocked)
}
