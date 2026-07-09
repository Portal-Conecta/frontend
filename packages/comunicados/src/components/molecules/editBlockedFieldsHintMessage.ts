export const EDIT_BLOCKED_FIELDS_HINT_MESSAGE =
  'Alguns campos ficam bloqueados após a publicação e não podem ser alterados na edição.' as const

export function shouldShowEditBlockedFieldsHint(blocked?: boolean): boolean {
  return Boolean(blocked)
}
