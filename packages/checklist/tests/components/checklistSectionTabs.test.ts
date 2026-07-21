import { describe, expect, it } from 'vitest'

import { resolvePermissions, type CurrentUser, type TypeUser } from '@portal/core/rbac'

import { resolveChecklistSectionTabs } from '../../src/components/checklistSectionTabs'

function userFor(userType: TypeUser): CurrentUser {
  return {
    id: `u-${userType}`,
    userType,
    classes: [],
    permissions: resolvePermissions(userType),
  }
}

describe('resolveChecklistSectionTabs', () => {
  it('ADMIN vê as 4 abas, incluindo Checklist', () => {
    const hrefs = resolveChecklistSectionTabs(userFor('ADMIN')).map((tab) => tab.href)
    expect(hrefs).toEqual([
      '/checklist',
      '/checklist/dashboard',
      '/checklist/monitor-envios',
      '/checklist/gestao',
    ])
  })

  it.each(['SENAI', 'WEG'] as const)('%s vê só gestão — sem a aba Checklist', (role) => {
    const hrefs = resolveChecklistSectionTabs(userFor(role)).map((tab) => tab.href)
    expect(hrefs).toEqual(['/checklist/dashboard', '/checklist/monitor-envios', '/checklist/gestao'])
  })

  it('usuário nulo cai no mesmo caso de gestão (sem Checklist)', () => {
    const hrefs = resolveChecklistSectionTabs(null).map((tab) => tab.href)
    expect(hrefs).not.toContain('/checklist')
  })
})
