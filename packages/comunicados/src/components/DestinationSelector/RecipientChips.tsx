import { Tag, Text } from '@portal/ui'

import type { Recipient } from './types'

export interface RecipientChipsProps {
  recipients: readonly Recipient[]
  onRemove: (key: string) => void
  disabled?: boolean
}

/**
 * Lista dos destinatários já escolhidos, exibida abaixo dos painéis de seleção.
 * Cada item é uma `Tag` removível (reusa o átomo do DS). Compartilhada pelos três
 * modos — a seleção de qualquer painel alimenta a mesma lista.
 */
export function RecipientChips({ recipients, onRemove, disabled = false }: RecipientChipsProps) {
  if (recipients.length === 0) {
    return (
      <Text as="p" variant="body-sm" tone="secondary">
        Nenhum destinatário selecionado ainda.
      </Text>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Text as="p" variant="label-sm-emphasis" tone="brand">
        Destinatários selecionados ({recipients.length})
      </Text>

      <ul className="flex flex-wrap gap-2">
        {recipients.map((recipient) => (
          <li key={recipient.key}>
            <Tag
              tone="info"
              size="sm"
              removeLabel={`Remover ${recipient.label}`}
              {...(disabled ? {} : { onRemove: () => onRemove(recipient.key) })}
            >
              {recipient.label}
            </Tag>
          </li>
        ))}
      </ul>
    </div>
  )
}
