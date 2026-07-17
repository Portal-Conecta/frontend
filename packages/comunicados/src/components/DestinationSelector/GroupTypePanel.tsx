'use client'

import { Icon, Text, type IconName } from '@portal/ui'

import { hasRecipient, makeRecipient, recipientKey, type Recipient, type RecipientGroup } from './types'

export interface GroupTypePanelProps {
  recipients: readonly Recipient[]
  onToggle: (recipient: Recipient) => void
  disabled?: boolean
}

interface GroupDef {
  group: RecipientGroup
  label: string
  icon: IconName
}

const GROUPS: readonly GroupDef[] = [
  { group: 'STUDENTS', label: 'Todos os Alunos', icon: 'user' },
  { group: 'TEACHERS', label: 'Todos os Professores', icon: 'graduation-cap' },
  { group: 'REPRESENTATIVES', label: 'Todos os Representantes', icon: 'users' },
]

/**
 * Modo "Selecionar usuários por tipo". Três cards que alternam grupos amplos por
 * papel. Seleção múltipla (pode marcar mais de um). No publish/schedule viram
 * `roles` (`STUDENT` / `TEACHER` / `REPRESENTATIVE`) — não confundir com destino
 * GENERAL (escopo espacial sem restrição de papel).
 */
export function GroupTypePanel({ recipients, onToggle, disabled = false }: GroupTypePanelProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {GROUPS.map((item) => {
        const selected = hasRecipient(recipients, recipientKey('group', item.group))

        const stateClass = selected
          ? 'border-interactive-default bg-interactive-subtle'
          : 'border-border-default bg-background-surface hover:border-interactive-default'

        return (
          <button
            key={item.group}
            type="button"
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => onToggle(makeRecipient('group', item.group, item.label))}
            className={
              'flex flex-col items-center justify-center gap-3 rounded-md border-sm px-4 py-8 ' +
              'text-interactive-default transition-colors ' +
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 ' +
              'disabled:cursor-not-allowed disabled:opacity-70 ' +
              stateClass
            }
          >
            <Icon name={item.icon} size="lg" decorative />
            <Text as="span" variant="label-md-emphasis" tone="brand">
              {item.label}
            </Text>
          </button>
        )
      })}
    </div>
  )
}
