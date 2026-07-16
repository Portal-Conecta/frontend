import { describe, expect, it } from 'vitest'

import { canCreateAnnouncement } from '../../src/auth/canCreateAnnouncement'
import { mapRecipientsToPayload } from '../../src/components/CreateAnnouncementWizard/mapRecipientsToPayload'
import { makeRecipient } from '../../src/components/DestinationSelector/types'
import type { Tag } from '../../src/types/tag'
import type { CurrentUser } from '@portal/core'

function user(userType: CurrentUser['userType']): CurrentUser {
  return {
    id: 'u1',
    userType,
    classes: [],
    permissions: [],
  }
}

const COURSE_UUID = '550e8400-e29b-41d4-a716-446655440001'
const CLASS_UUID = '550e8400-e29b-41d4-a716-446655440002'
const TAG_COURSE_ID = '550e8400-e29b-41d4-a716-446655440011'
const TAG_CLASS_ID = '550e8400-e29b-41d4-a716-446655440012'

const tags: Tag[] = [
  {
    id: TAG_COURSE_ID,
    name: 'DS',
    entityType: 'COURSE',
    hubEntityId: COURSE_UUID,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: TAG_CLASS_ID,
    name: 'DS 2026',
    entityType: 'CLASS',
    hubEntityId: CLASS_UUID,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
]

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
  it('mapeia curso e turma para destino + tag.id interno (não hub id)', () => {
    const result = mapRecipientsToPayload(
      [
        makeRecipient('course', COURSE_UUID, 'DS'),
        makeRecipient('class', CLASS_UUID, 'DS 2026'),
      ],
      tags,
    )

    expect(result.destinations).toEqual([
      { type: 'COURSE', referenceId: COURSE_UUID },
      { type: 'CLASS', referenceId: CLASS_UUID },
    ])
    expect(result.tagIds).toEqual([TAG_COURSE_ID, TAG_CLASS_ID])
    expect(result.shiftCodes).toEqual([])
    expect(result.roles).toEqual([])
    expect(result.errors).toEqual([])
  })

  it('mapeia usuário específico', () => {
    const result = mapRecipientsToPayload([makeRecipient('user', 'u-01', 'Ana')], tags)
    expect(result.destinations).toEqual([{ type: 'USER', referenceId: 'u-01' }])
    expect(result.tagIds).toEqual([])
    expect(result.shiftCodes).toEqual([])
    expect(result.roles).toEqual([])
  })

  it('turno vai em shiftCodes e não em tagIds; GENERAL sem roles = qualquer papel', () => {
    const result = mapRecipientsToPayload(
      [makeRecipient('shift', 'FULL_AM_PM', 'Manhã e tarde')],
      tags,
    )
    expect(result.destinations).toEqual([{ type: 'GENERAL' }])
    expect(result.tagIds).toEqual([])
    expect(result.shiftCodes).toEqual(['FULL_AM_PM'])
    expect(result.roles).toEqual([])
    expect(result.errors).toEqual([])
  })

  it('Todos os Alunos → GENERAL + roles STUDENT', () => {
    const result = mapRecipientsToPayload(
      [makeRecipient('group', 'STUDENTS', 'Todos os Alunos')],
      tags,
    )
    expect(result.destinations).toEqual([{ type: 'GENERAL' }])
    expect(result.roles).toEqual(['STUDENT'])
    expect(result.tagIds).toEqual([])
  })

  it('Todos os Professores → GENERAL + roles TEACHER', () => {
    const result = mapRecipientsToPayload(
      [makeRecipient('group', 'TEACHERS', 'Todos os Professores')],
      tags,
    )
    expect(result.destinations).toEqual([{ type: 'GENERAL' }])
    expect(result.roles).toEqual(['TEACHER'])
  })

  it('curso + só alunos → COURSE + roles STUDENT (sem GENERAL)', () => {
    const result = mapRecipientsToPayload(
      [
        makeRecipient('course', COURSE_UUID, 'DS'),
        makeRecipient('group', 'STUDENTS', 'Todos os Alunos'),
      ],
      tags,
    )
    expect(result.destinations).toEqual([{ type: 'COURSE', referenceId: COURSE_UUID }])
    expect(result.roles).toEqual(['STUDENT'])
    expect(result.tagIds).toEqual([TAG_COURSE_ID])
  })

  it('vários grupos acumulam roles sem duplicar', () => {
    const result = mapRecipientsToPayload(
      [
        makeRecipient('group', 'STUDENTS', 'Todos os Alunos'),
        makeRecipient('group', 'TEACHERS', 'Todos os Professores'),
        makeRecipient('group', 'STUDENTS', 'Todos os Alunos'),
      ],
      tags,
    )
    expect(result.destinations).toEqual([{ type: 'GENERAL' }])
    expect(result.roles).toEqual(['STUDENT', 'TEACHER'])
  })

  it('broadcast EVERYONE → GENERAL sem roles', () => {
    const result = mapRecipientsToPayload(
      [makeRecipient('group', 'EVERYONE', 'Público geral')],
      tags,
    )
    expect(result.destinations).toEqual([{ type: 'GENERAL' }])
    expect(result.roles).toEqual([])
  })

  it('erro quando tag de curso não existe no catálogo', () => {
    const result = mapRecipientsToPayload(
      [makeRecipient('course', COURSE_UUID, 'DS')],
      [],
    )
    expect(result.tagIds).toEqual([])
    expect(result.errors).toContain('Tag de curso não encontrada para “DS”.')
  })

  it('erro quando código de turno é inválido', () => {
    const result = mapRecipientsToPayload(
      [makeRecipient('shift', 'turno-manha', 'Manhã')],
      tags,
    )
    expect(result.shiftCodes).toEqual([])
    expect(result.errors).toContain('Turno inválido: “Manhã”.')
  })

  it('deduplica destinos e tags', () => {
    const result = mapRecipientsToPayload(
      [
        makeRecipient('course', COURSE_UUID, 'DS'),
        makeRecipient('course', COURSE_UUID, 'DS'),
      ],
      tags,
    )
    expect(result.destinations).toHaveLength(1)
    expect(result.tagIds).toEqual([TAG_COURSE_ID])
  })
})
