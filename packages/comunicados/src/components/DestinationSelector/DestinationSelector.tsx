'use client'

import { useState } from 'react'

import { RadioGroup, Text, type SelectOption } from '@portal/ui'

import { GroupTypePanel } from './GroupTypePanel'
import { RecipientChips } from './RecipientChips'
import { TagFilterPanel } from './TagFilterPanel'
import { UserSearchPanel, type UsersPageState } from './UserSearchPanel'
import {
  addRecipient,
  removeRecipient,
  toggleRecipient,
  type Recipient,
  type UserSummary,
} from './types'

/** Modo de seleção de destinatários (coluna da esquerda). */
export type DestinationMode = 'filter' | 'group' | 'user'

const MODE_OPTIONS: readonly { value: DestinationMode; label: string }[] = [
  { value: 'filter', label: 'Filtrar usuários por curso, turma ou turno' },
  { value: 'group', label: 'Selecionar usuários por tipo' },
  { value: 'user', label: 'Buscar usuários específicos' },
]

export interface DestinationSelectorProps {
  /** Destinatários selecionados (controlado). Se omitido, o componente gerencia o próprio estado. */
  value?: Recipient[]
  /** Notifica cada mudança na lista de destinatários. */
  onChange?: (recipients: Recipient[]) => void
  /** Opções de curso (Hub). */
  courses?: SelectOption[]
  /** Opções de turma (Hub). */
  classes?: SelectOption[]
  /** Turnos (`Shift` enum do core). */
  shifts?: SelectOption[]
  /** Usuários estáticos (Storybook). */
  users?: UserSummary[]
  /** Paginação de usuários via BFF. */
  usersPage?: UsersPageState
  usersQuery?: string
  onUsersQueryChange?: (query: string) => void
  onUsersPageChange?: (page: number) => void
  usersLoading?: boolean
  /** Carregando cursos/turmas. */
  catalogLoading?: boolean
  /** Modos disponíveis (varia por persona — RN-COM-PA02/PA03). Default: todos. */
  modes?: readonly DestinationMode[]
  /** Itens por página na busca de usuários. */
  usersPageSize?: number
  disabled?: boolean
  /** Título da seção. */
  title?: string
}

/**
 * DestinationSelector (#195) — escolhe o público-alvo do comunicado.
 *
 * Coluna esquerda: `RadioGroup` com os três modos. Coluna direita: o painel do
 * modo ativo. Abaixo, a lista compartilhada de destinatários (`RecipientChips`),
 * alimentada por qualquer modo. Fonte dos dados via props (default = mock
 * documentado); o mapeamento para o payload de destinos fica no formulário (#197).
 */
export function DestinationSelector({
  value,
  onChange,
  courses = [],
  classes = [],
  shifts = [],
  users,
  usersPage,
  usersQuery,
  onUsersQueryChange,
  onUsersPageChange,
  usersLoading = false,
  catalogLoading = false,
  modes = ['filter', 'group', 'user'],
  usersPageSize,
  disabled = false,
  title = 'Selecione quem deve receber esse comunicado',
}: DestinationSelectorProps) {
  const [internal, setInternal] = useState<Recipient[]>(value ?? [])
  const recipients = value ?? internal

  const availableModes = MODE_OPTIONS.filter((option) => modes.includes(option.value))
  const [mode, setMode] = useState<DestinationMode>(availableModes[0]?.value ?? 'filter')
  // Se `modes` mudar depois do mount (persona async no #197), evita painel órfão.
  const activeMode = modes.includes(mode) ? mode : (availableModes[0]?.value ?? 'filter')

  function commit(next: Recipient[]) {
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }

  const handleAdd = (recipient: Recipient) => commit(addRecipient(recipients, recipient))
  const handleToggle = (recipient: Recipient) => commit(toggleRecipient(recipients, recipient))
  const handleRemove = (key: string) => commit(removeRecipient(recipients, key))

  return (
    <section className="w-full">
      <Text as="h2" variant="body-xl-emphasis" tone="brand">
        {title}
      </Text>

      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        <aside className="md:w-fit md:shrink-0">
          <Text as="p" variant="label-sm-emphasis" tone="brand" className="mb-4">
            Filtrar usuário por:
          </Text>

          <RadioGroup
            value={activeMode}
            onChange={(next) => setMode(next as DestinationMode)}
            options={availableModes}
            size="sm"
            disabled={disabled}
            aria-label="Como selecionar os destinatários"
          />
        </aside>

        <div className="flex flex-1 flex-col gap-6 md:border-l md:border-border-default md:pl-8">
          {catalogLoading ? (
            <Text as="p" variant="body-sm" tone="secondary">
              Carregando cursos e turmas…
            </Text>
          ) : null}

          {activeMode === 'filter' && !catalogLoading ? (
            <TagFilterPanel
              courses={courses}
              classes={classes}
              shifts={shifts}
              onAdd={handleAdd}
              disabled={disabled}
            />
          ) : null}

          {activeMode === 'group' ? (
            <GroupTypePanel recipients={recipients} onToggle={handleToggle} disabled={disabled} />
          ) : null}

          {activeMode === 'user' ? (
            <UserSearchPanel
              {...(users != null ? { users } : {})}
              {...(usersPage != null ? { usersPage } : {})}
              {...(usersQuery != null ? { usersQuery } : {})}
              {...(onUsersQueryChange ? { onUsersQueryChange } : {})}
              {...(onUsersPageChange ? { onUsersPageChange } : {})}
              usersLoading={usersLoading}
              recipients={recipients}
              onToggle={handleToggle}
              disabled={disabled}
              {...(usersPageSize != null ? { pageSize: usersPageSize } : {})}
            />
          ) : null}

          <RecipientChips recipients={recipients} onRemove={handleRemove} disabled={disabled} />
        </div>
      </div>
    </section>
  )
}
