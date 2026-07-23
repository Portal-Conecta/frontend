import { describe, expect, it } from 'vitest'

import {
  ALL_USER_ACCOUNT_STATUSES,
  directoryUserStatusLabel,
  USER_ACCOUNT_STATUS_LABELS,
  USER_STATUS_FILTER_OPTIONS,
} from '../../src/users/usersLabels'

describe('usersLabels', () => {
  it('mapeia active booleano para rótulo de status', () => {
    expect(directoryUserStatusLabel(true)).toBe(USER_ACCOUNT_STATUS_LABELS.ACTIVE)
    expect(directoryUserStatusLabel(false)).toBe(USER_ACCOUNT_STATUS_LABELS.DISABLED)
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
