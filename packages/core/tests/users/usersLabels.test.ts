import { describe, expect, it } from 'vitest'

import {
  directoryUserStatusLabel,
  USER_ACCOUNT_STATUS_LABELS,
} from '../../src/users/usersLabels'

describe('usersLabels', () => {
  it('mapeia active booleano para rótulo de status', () => {
    expect(directoryUserStatusLabel(true)).toBe(USER_ACCOUNT_STATUS_LABELS.ACTIVE)
    expect(directoryUserStatusLabel(false)).toBe(USER_ACCOUNT_STATUS_LABELS.DISABLED)
  })
})
