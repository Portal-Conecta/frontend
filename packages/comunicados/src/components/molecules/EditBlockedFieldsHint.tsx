import { Text } from '@portal/ui'

import {
  EDIT_BLOCKED_FIELDS_HINT_MESSAGE,
  shouldShowEditBlockedFieldsHint,
} from './editBlockedFieldsHintMessage'

/**
 * EditBlockedFieldsHint — aviso exibido no formulário de edição quando o
 * comunicado já foi publicado e certos campos ficam bloqueados.
 *
 * Vive no domínio comunicados (não no DS) porque o texto é regra de negócio.
 * Usa superfície clara (mesmo padrão de aviso do CreateAnnouncementWizard),
 * não o Alert do DS — modelado para overlay com texto inverse.
 */
interface EditBlockedFieldsHintProps {
  blocked?: boolean
}

export function EditBlockedFieldsHint({ blocked = false }: EditBlockedFieldsHintProps) {
  if (!shouldShowEditBlockedFieldsHint(blocked)) return null

  return (
    <div
      role="status"
      className="flex items-stretch gap-4 rounded-md border-sm border-feedback-warning/20 bg-feedback-warning/5 px-4 py-3"
    >
      <span className="w-[3px] shrink-0 rounded-full bg-feedback-warning" aria-hidden="true" />
      <Text as="p" variant="body-sm" tone="secondary">
        {EDIT_BLOCKED_FIELDS_HINT_MESSAGE}
      </Text>
    </div>
  )
}
