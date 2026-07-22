import { describe, expect, it } from 'vitest'

import { usesReducedMuralFilters } from '../../src/components/AnnouncementFiltersBar/usesReducedMuralFilters'

describe('usesReducedMuralFilters', () => {
  it('reduz filtros para aluno e representante', () => {
    expect(usesReducedMuralFilters('STUDENT')).toBe(true)
    expect(usesReducedMuralFilters('REPRESENTATIVE')).toBe(true)
  })

  it('mantém filtros completos para demais papéis', () => {
    expect(usesReducedMuralFilters('TEACHER')).toBe(false)
    expect(usesReducedMuralFilters('SENAI')).toBe(false)
    expect(usesReducedMuralFilters('WEG')).toBe(false)
    expect(usesReducedMuralFilters('ADMIN')).toBe(false)
    expect(usesReducedMuralFilters(undefined)).toBe(false)
  })
})
