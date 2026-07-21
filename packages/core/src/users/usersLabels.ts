import type { SelectOption } from '@portal/ui'

import { USER_ACCOUNT_STATUS_VALUES, type UserAccountStatus } from '../classes/types'
import { ROLE_LABELS } from '../profile/roleLabels'
import { TYPE_USER_VALUES, type TypeUser } from '../rbac'

/** Rótulos PT-BR do status de conta na listagem/filtros (#440). */
export const USER_ACCOUNT_STATUS_LABELS: Record<UserAccountStatus, string> = {
  PENDING_ACTIVATION: 'Pendente de ativação',
  ACTIVE: 'Ativo',
  DISABLED: 'Inativo',
  PENDING_DELETION: 'Pendente de exclusão',
}

/** Exibição na linha: o item do diretório só traz `active` booleano. */
export function directoryUserStatusLabel(active: boolean): string {
  return active ? USER_ACCOUNT_STATUS_LABELS.ACTIVE : USER_ACCOUNT_STATUS_LABELS.DISABLED
}

const TODOS: SelectOption = { value: 'todos', label: 'Todos' }

/** Opções do filtro Tipo (inclui "Todos"). */
export const USER_TYPE_FILTER_OPTIONS: SelectOption[] = [
  TODOS,
  ...TYPE_USER_VALUES.map((type) => ({ value: type, label: ROLE_LABELS[type] })),
]

/** Opções do filtro Status (inclui "Todos"). */
export const USER_STATUS_FILTER_OPTIONS: SelectOption[] = [
  TODOS,
  ...USER_ACCOUNT_STATUS_VALUES.map((status) => ({
    value: status,
    label: USER_ACCOUNT_STATUS_LABELS[status],
  })),
]

/** Todos os status — enviado quando o filtro UI está em "Todos" (evita o default ACTIVE do back). */
export const ALL_USER_ACCOUNT_STATUSES: UserAccountStatus[] = [...USER_ACCOUNT_STATUS_VALUES]

export function isTypeUserFilter(value: string | null | undefined): value is TypeUser {
  return typeof value === 'string' && (TYPE_USER_VALUES as readonly string[]).includes(value)
}

export function isStatusFilter(value: string | null | undefined): value is UserAccountStatus {
  return (
    typeof value === 'string' &&
    (USER_ACCOUNT_STATUS_VALUES as readonly string[]).includes(value)
  )
}
