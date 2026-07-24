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
  it('ADMIN vê as 5 abas, incluindo Checklist e Janelas de envio', () => {
    const hrefs = resolveChecklistSectionTabs(userFor('ADMIN')).map((tab) => tab.href)
    expect(hrefs).toEqual([
      '/checklist',
      '/checklist/dashboard',
      '/checklist/nao-conformidades',
      '/checklist/gestao-itens',
      '/checklist/janelas',
    ])
  })

  it.each(['SENAI', 'WEG'] as const)('%s vê gestão + Janelas de envio — sem a aba Checklist', (role) => {
    const hrefs = resolveChecklistSectionTabs(userFor(role)).map((tab) => tab.href)
    expect(hrefs).toEqual([
      '/checklist/dashboard',
      '/checklist/nao-conformidades',
      '/checklist/gestao-itens',
      '/checklist/janelas',
    ])
  })

  it('TEACHER não vê Janelas de envio (sem checklist:janelas)', () => {
    const hrefs = resolveChecklistSectionTabs(userFor('TEACHER')).map((tab) => tab.href)
    expect(hrefs).not.toContain('/checklist/janelas')
  })

  it('usuário nulo cai no mesmo caso de gestão (sem Checklist, sem Janelas de envio)', () => {
    const hrefs = resolveChecklistSectionTabs(null).map((tab) => tab.href)
    expect(hrefs).not.toContain('/checklist')
    expect(hrefs).not.toContain('/checklist/janelas')
  })
})
