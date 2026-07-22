import { describe, expect, it } from 'vitest'

import { isUserAccountStatus, USER_ACCOUNT_STATUS_VALUES } from '@portal/core/classes/types'

describe('UserAccountStatus', () => {
  it('expõe os status aceitos pelo filtro de usuários', () => {
    expect(USER_ACCOUNT_STATUS_VALUES).toEqual([
      'PENDING_ACTIVATION',
      'ACTIVE',
      'DISABLED',
      'PENDING_DELETION',
    ])
  })

  it('valida apenas status conhecidos', () => {
    expect(isUserAccountStatus('ACTIVE')).toBe(true)
    expect(isUserAccountStatus('UNKNOWN')).toBe(false)
    expect(isUserAccountStatus(null)).toBe(false)
  })
})
