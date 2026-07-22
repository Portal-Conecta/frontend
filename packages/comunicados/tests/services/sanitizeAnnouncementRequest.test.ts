import { describe, expect, it } from 'vitest'

import {
  isUuid,
  sanitizePublishBody,
  sanitizeScheduleBody,
} from '../../src/services/sanitizeAnnouncementRequest'

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'

describe('isUuid', () => {
  it('aceita UUID válido', () => {
    expect(isUuid(VALID_UUID)).toBe(true)
  })

  it('rejeita slug de mock', () => {
    expect(isUuid('curso-ds')).toBe(false)
    expect(isUuid('turno-manha')).toBe(false)
    expect(isUuid('u-01')).toBe(false)
  })
})

describe('sanitizePublishBody', () => {
  const base = {
    title: 'Título',
    description: 'Descrição',
    origin: 'BOTH' as const,
    destinations: [{ type: 'GENERAL' as const }],
    pinned: false,
    tagIds: ['curso-ds', VALID_UUID],
  }

  it('remove tagIds inválidos e omite o campo quando vazio', () => {
    const result = sanitizePublishBody({
      ...base,
      tagIds: ['curso-ds', 'turno-manha'],
    })

    expect(result.tagIds).toBeUndefined()
    expect(result.destinations).toEqual([{ type: 'GENERAL' }])
    expect(result.pinned).toBeUndefined()
  })

  it('mantém tagIds com UUID válido', () => {
    const result = sanitizePublishBody(base)

    expect(result.tagIds).toEqual([VALID_UUID])
  })

  it('mantém shiftCodes válidos e descarta inválidos', () => {
    const result = sanitizePublishBody({
      ...base,
      tagIds: [],
      shiftCodes: ['FULL_AM_PM', 'turno-manha'] as ('FULL_AM_PM' | 'FULL_PM_NT')[],
    })

    expect(result.shiftCodes).toEqual(['FULL_AM_PM'])
  })

  it('omite shiftCodes quando vazio após filtro', () => {
    const result = sanitizePublishBody({
      ...base,
      tagIds: [],
      shiftCodes: ['turno-manha'] as unknown as ('FULL_AM_PM' | 'FULL_PM_NT')[],
    })

    expect(result.shiftCodes).toBeUndefined()
  })

  it('mantém roles válidos e omite o campo quando vazio', () => {
    const withRoles = sanitizePublishBody({
      ...base,
      tagIds: [],
      roles: ['STUDENT', 'TEACHER'],
    })
    expect(withRoles.roles).toEqual(['STUDENT', 'TEACHER'])

    const withoutRoles = sanitizePublishBody({
      ...base,
      tagIds: [],
      roles: [],
    })
    expect(withoutRoles.roles).toBeUndefined()

    const filtered = sanitizePublishBody({
      ...base,
      tagIds: [],
      roles: ['STUDENT', 'NOT_A_ROLE' as 'STUDENT'],
    })
    expect(filtered.roles).toEqual(['STUDENT'])
  })

  it('remove destino com referenceId inválido e cai em GENERAL', () => {
    const result = sanitizePublishBody({
      ...base,
      destinations: [{ type: 'COURSE', referenceId: 'curso-ds' }],
      tagIds: [],
    })

    expect(result.destinations).toEqual([{ type: 'GENERAL' }])
  })

  it('mantém destino com referenceId UUID', () => {
    const result = sanitizePublishBody({
      ...base,
      destinations: [{ type: 'USER', referenceId: VALID_UUID }],
      tagIds: [],
    })

    expect(result.destinations).toEqual([{ type: 'USER', referenceId: VALID_UUID }])
  })
})

describe('sanitizeScheduleBody', () => {
  it('preserva scheduledFor e shiftCodes', () => {
    const result = sanitizeScheduleBody({
      title: 'T',
      description: 'D',
      origin: 'BOTH',
      destinations: [{ type: 'GENERAL' }],
      scheduledFor: '2026-12-31T03:00:00.000Z',
      tagIds: ['invalid'],
      shiftCodes: ['FULL_PM_NT'],
    })

    expect(result.scheduledFor).toBe('2026-12-31T03:00:00.000Z')
    expect(result.tagIds).toBeUndefined()
    expect(result.shiftCodes).toEqual(['FULL_PM_NT'])
  })
})
