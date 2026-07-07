import { Text } from '@portal/ui'

/**
 * EditBlockedFieldsHint — aviso exibido no formulário de edição quando o
 * comunicado já foi publicado e certos campos ficam bloqueados.
 *
 * Vive no domínio comunicados (não no DS) porque o texto é regra de negócio.
 */
interface EditBlockedFieldsHintProps {
  blocked?: boolean
}

export function EditBlockedFieldsHint({ blocked = false }: EditBlockedFieldsHintProps) {
  if (!blocked) return null

  return (
    <div className="rounded-md bg-feedback-warning-subtle px-4 py-3">
      <Text as="p" variant="body-sm" tone="secondary">
        Alguns campos ficam bloqueados após a publicação e não podem ser alterados na edição.
      </Text>
    </div>
  )
}