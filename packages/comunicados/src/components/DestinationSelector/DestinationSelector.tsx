'use client'

import { useState } from 'react'

import { RadioGroup, Text, type SelectOption } from '@portal/ui'

import { GroupTypePanel } from './GroupTypePanel'
import { RecipientChips } from './RecipientChips'
import { TagFilterPanel } from './TagFilterPanel'
import { UserSearchPanel } from './UserSearchPanel'
import { mockClasses, mockCourses, mockShifts, mockUsers } from './mockData'
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
  /** Opções de curso (tags `COURSE`). Default: mock documentado. */
  courses?: SelectOption[]
  /** Opções de turma (tags `CLASS`). Default: mock documentado. */
  classes?: SelectOption[]
  /** Opções de turno (lista fixa até o back ter o conceito). Default: mock documentado. */
  shifts?: SelectOption[]
  /** Usuários para a busca do modo 3. Default: mock documentado. */
  users?: UserSummary[]
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
  courses = mockCourses,
  classes = mockClasses,
  shifts = mockShifts,
  users = mockUsers,
  modes = ['filter', 'group', 'user'],
  usersPageSize,
  disabled = false,
  title = 'Selecione quem deve receber esse comunicado',
}: DestinationSelectorProps) {
  const [internal, setInternal] = useState<Recipient[]>(value ?? [])
  const recipients = value ?? internal

  const availableModes = MODE_OPTIONS.filter((option) => modes.includes(option.value))
  const [mode, setMode] = useState<DestinationMode>(availableModes[0]?.value ?? 'filter')

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
            value={mode}
            onChange={(next) => setMode(next as DestinationMode)}
            options={availableModes}
            size="sm"
            disabled={disabled}
            aria-label="Como selecionar os destinatários"
            className='gap-4'
          />
        </aside>

        <div className="flex flex-1 flex-col gap-6 md:border-l md:border-border-default md:pl-8">
          {mode === 'filter' ? (
            <TagFilterPanel
              courses={courses}
              classes={classes}
              shifts={shifts}
              onAdd={handleAdd}
              disabled={disabled}
            />
          ) : null}

          {mode === 'group' ? (
            <GroupTypePanel recipients={recipients} onToggle={handleToggle} disabled={disabled} />
          ) : null}

          {mode === 'user' ? (
            <UserSearchPanel
              users={users}
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
