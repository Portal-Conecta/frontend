import { describe, expect, it } from 'vitest'

import { resolvePermissions, type CurrentUser, type TypeUser } from '@portal/core/rbac'

import { canViewChecklistDashboard } from '../../src/auth/canViewChecklistDashboard'

function userFor(userType: TypeUser): CurrentUser {
  return {
    id: `u-${userType}`,
    userType,
    classes: [],
    permissions: resolvePermissions(userType),
  }
}

describe('canViewChecklistDashboard', () => {
  it.each(['SENAI', 'WEG', 'ADMIN'] as const)('%s pode ver o dashboard', (role) => {
    expect(canViewChecklistDashboard(userFor(role))).toBe(true)
  })

  it.each(['STUDENT', 'REPRESENTATIVE', 'TEACHER'] as const)('%s não pode ver o dashboard', (role) => {
    expect(canViewChecklistDashboard(userFor(role))).toBe(false)
  })

  it('usuário nulo não pode ver', () => {
    expect(canViewChecklistDashboard(null)).toBe(false)
  })
})
