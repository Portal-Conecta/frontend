import { describe, expect, it } from 'vitest'

import { canCreateAnnouncement } from '../../src/auth/canCreateAnnouncement'
import { mapRecipientsToPayload } from '../../src/components/CreateAnnouncementWizard/mapRecipientsToPayload'
import { makeRecipient } from '../../src/components/DestinationSelector/types'
import type { CurrentUser } from '@portal/core'

function user(userType: CurrentUser['userType']): CurrentUser {
  return {
    id: 'u1',
    userType,
    classes: [],
    permissions: [],
  }
}

describe('canCreateAnnouncement', () => {
  it('permite professores e gestores', () => {
    expect(canCreateAnnouncement(user('TEACHER'))).toBe(true)
    expect(canCreateAnnouncement(user('SENAI'))).toBe(true)
    expect(canCreateAnnouncement(user('WEG'))).toBe(true)
    expect(canCreateAnnouncement(user('ADMIN'))).toBe(true)
  })

  it('nega alunos e representantes', () => {
    expect(canCreateAnnouncement(user('STUDENT'))).toBe(false)
    expect(canCreateAnnouncement(user('REPRESENTATIVE'))).toBe(false)
    expect(canCreateAnnouncement(null)).toBe(false)
  })
})

describe('mapRecipientsToPayload', () => {
  it('mapeia curso e turma para destino + tagIds', () => {
    const result = mapRecipientsToPayload([
      makeRecipient('course', 'curso-ds', 'DS'),
      makeRecipient('class', 'turma-ds-2026', 'DS 2026'),
    ])

    expect(result.destinations).toEqual([
      { type: 'COURSE', referenceId: 'curso-ds' },
      { type: 'CLASS', referenceId: 'turma-ds-2026' },
    ])
    expect(result.tagIds).toEqual(['curso-ds', 'turma-ds-2026'])
  })

  it('mapeia usuário específico', () => {
    const result = mapRecipientsToPayload([makeRecipient('user', 'u-01', 'Ana')])
    expect(result.destinations).toEqual([{ type: 'USER', referenceId: 'u-01' }])
    expect(result.tagIds).toEqual([])
  })

  it('turno vira tagId sem destino próprio', () => {
    const result = mapRecipientsToPayload([makeRecipient('shift', 'turno-manha', 'Manhã')])
    expect(result.destinations).toEqual([{ type: 'GENERAL' }])
    expect(result.tagIds).toEqual(['turno-manha'])
  })

  it('deduplica destinos e tags', () => {
    const result = mapRecipientsToPayload([
      makeRecipient('course', 'curso-ds', 'DS'),
      makeRecipient('course', 'curso-ds', 'DS'),
    ])
    expect(result.destinations).toHaveLength(1)
    expect(result.tagIds).toEqual(['curso-ds'])
  })
})
