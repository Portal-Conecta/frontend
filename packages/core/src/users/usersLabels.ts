import type { SelectOption, TagTone } from '@portal/ui'

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

/** Tom da `Tag` de status na linha/perfil (#535). `PENDING_DELETION` não aparece na UI — é filtrado como deletado. */
const USER_ACCOUNT_STATUS_TONE: Record<UserAccountStatus, TagTone> = {
  PENDING_ACTIVATION: 'warning',
  ACTIVE: 'positive',
  DISABLED: 'negative',
  PENDING_DELETION: 'negative',
}

export interface UserStatusTagInfo {
  tone: TagTone
  label: string
}

/** Tom + rótulo da `Tag` de status a partir do `accountStatus` do backend (#535). */
export function userAccountStatusTag(status: UserAccountStatus): UserStatusTagInfo {
  return { tone: USER_ACCOUNT_STATUS_TONE[status], label: USER_ACCOUNT_STATUS_LABELS[status] }
}

const TODOS: SelectOption = { value: 'todos', label: 'Todos' }

/** Opções do filtro Tipo (inclui "Todos"). */
export const USER_TYPE_FILTER_OPTIONS: SelectOption[] = [
  TODOS,
  ...TYPE_USER_VALUES.map((type) => ({ value: type, label: ROLE_LABELS[type] })),
]

/**
 * Status "visíveis" na listagem — exclui `PENDING_DELETION` (#506): o perfil
 * de um usuário marcado para exclusão dá not found ao abrir, então nem o
 * filtro "Todos" nem o dropdown de Status devem oferecer esse estado.
 */
const VISIBLE_USER_ACCOUNT_STATUSES = USER_ACCOUNT_STATUS_VALUES.filter(
  (status) => status !== 'PENDING_DELETION',
)

/** Opções do filtro Status (inclui "Todos"). */
export const USER_STATUS_FILTER_OPTIONS: SelectOption[] = [
  TODOS,
  ...VISIBLE_USER_ACCOUNT_STATUSES.map((status) => ({
    value: status,
    label: USER_ACCOUNT_STATUS_LABELS[status],
  })),
]

/** Status visíveis — enviado quando o filtro UI está em "Todos" (evita o default ACTIVE do back). */
export const ALL_USER_ACCOUNT_STATUSES: UserAccountStatus[] = [...VISIBLE_USER_ACCOUNT_STATUSES]

export function isTypeUserFilter(value: string | null | undefined): value is TypeUser {
  return typeof value === 'string' && (TYPE_USER_VALUES as readonly string[]).includes(value)
}

export function isStatusFilter(value: string | null | undefined): value is UserAccountStatus {
  return (
    typeof value === 'string' &&
    (USER_ACCOUNT_STATUS_VALUES as readonly string[]).includes(value)
  )
}
