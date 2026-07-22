'use client'

/**
 * UsersFiltersBar — painel lateral Tipo + Status (#440), com Aplicar/Restaurar.
 * Espelha o padrão visual do AnnouncementFiltersBar (sidebar/sheet).
 */
import { useState } from 'react'

import { Button, Field, Select, Text, type SelectOption } from '@portal/ui'

import {
  USER_STATUS_FILTER_OPTIONS,
  USER_TYPE_FILTER_OPTIONS,
} from '../../usersLabels'
import type { UsersListFilters } from '../../toListUsersParams'
import { normalizeUsersFilters } from '../../toListUsersParams'

export interface UsersFiltersBarProps {
  onApply?: (filters: UsersListFilters) => void
  onRestore?: () => void
  variant?: 'sidebar' | 'sheet'
  titleId?: string
  initialFilters?: UsersListFilters
  typeOptions?: SelectOption[]
  statusOptions?: SelectOption[]
}

export function UsersFiltersBar({
  onApply,
  onRestore,
  variant = 'sidebar',
  titleId,
  initialFilters,
  typeOptions = USER_TYPE_FILTER_OPTIONS,
  statusOptions = USER_STATUS_FILTER_OPTIONS,
}: UsersFiltersBarProps) {
  const [typeUser, setTypeUser] = useState<string | null>(initialFilters?.typeUser ?? 'todos')
  const [status, setStatus] = useState<string | null>(initialFilters?.status ?? 'todos')

  const isSheet = variant === 'sheet'

  function handleApply() {
    onApply?.(normalizeUsersFilters({ typeUser, status }))
  }

  function handleRestore() {
    setTypeUser('todos')
    setStatus('todos')
    onRestore?.()
  }

  const shellClass = isSheet
    ? 'flex w-full flex-col gap-3 bg-background-default px-6 py-6'
    : 'w-full bg-background-surface px-8 pb-6'

  const fieldsClass = isSheet ? 'flex flex-col gap-3' : 'mt-7 flex flex-col gap-4'

  return (
    <aside className={shellClass}>
      <Text
        as="h2"
        id={titleId}
        variant={isSheet ? 'body-md-emphasis' : 'body-xl-emphasis'}
        tone="brand"
      >
        Filtros
      </Text>

      <div className={fieldsClass}>
        <Field label="Tipo">
          <Select
            options={typeOptions}
            value={typeUser}
            onChange={setTypeUser}
            placeholder="Todos"
            size="sm"
          />
        </Field>

        <Field label="Status">
          <Select
            options={statusOptions}
            value={status}
            onChange={setStatus}
            placeholder="Todos"
            size="sm"
          />
        </Field>

        <div className={isSheet ? 'flex gap-3 pt-1' : 'grid grid-cols-2 gap-6 pt-4'}>
          <Button variant="outlined" fullWidth onClick={handleRestore}>
            Restaurar
          </Button>
          <Button fullWidth onClick={handleApply}>
            Aplicar
          </Button>
        </div>
      </div>
    </aside>
  )
}
