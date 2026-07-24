import { describe, expect, it } from 'vitest'

import {
  ALL_USER_ACCOUNT_STATUSES,
  USER_ACCOUNT_STATUS_LABELS,
  USER_STATUS_FILTER_OPTIONS,
  userAccountStatusTag,
} from '../../src/users/usersLabels'

describe('userAccountStatusTag', () => {
  it('mapeia PENDING_ACTIVATION para tom warning', () => {
    expect(userAccountStatusTag('PENDING_ACTIVATION')).toEqual({
      tone: 'warning',
      label: USER_ACCOUNT_STATUS_LABELS.PENDING_ACTIVATION,
    })
  })

  it('mapeia ACTIVE para tom positive', () => {
    expect(userAccountStatusTag('ACTIVE')).toEqual({
      tone: 'positive',
      label: USER_ACCOUNT_STATUS_LABELS.ACTIVE,
    })
  })

  it('mapeia DISABLED para tom negative', () => {
    expect(userAccountStatusTag('DISABLED')).toEqual({
      tone: 'negative',
      label: USER_ACCOUNT_STATUS_LABELS.DISABLED,
    })
  })

  it('não inclui PENDING_DELETION no conjunto enviado quando o filtro está em "Todos" (#506)', () => {
    expect(ALL_USER_ACCOUNT_STATUSES).not.toContain('PENDING_DELETION')
    expect(ALL_USER_ACCOUNT_STATUSES).toEqual(['PENDING_ACTIVATION', 'ACTIVE', 'DISABLED'])
  })

  it('não oferece "Pendente de exclusão" como opção do dropdown de Status (#506)', () => {
    expect(USER_STATUS_FILTER_OPTIONS.map((option) => option.value)).not.toContain(
      'PENDING_DELETION',
    )
  })
})
