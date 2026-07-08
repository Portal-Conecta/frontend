import { describe, expect, it } from 'vitest'

import {
  mapClassesToSelectOptions,
  mapCoursesToSelectOptions,
  mapUsersToSummaries,
} from '../../src/services/destinationCatalogMappers'

describe('destinationCatalogMappers', () => {
  it('mapeia cursos para SelectOption', () => {
    expect(
      mapCoursesToSelectOptions([
        { id: 'c2', name: 'Zebra', code: 'Z' },
        { id: 'c1', name: 'Alpha', code: 'A' },
      ]),
    ).toEqual([
      { value: 'c1', label: 'Alpha (A)' },
      { value: 'c2', label: 'Zebra (Z)' },
    ])
  })

  it('mapeia turmas para SelectOption', () => {
    expect(mapClassesToSelectOptions([{ id: 't1', name: 'DS 2026' }])).toEqual([
      { value: 't1', label: 'DS 2026' },
    ])
  })

  it('mapeia usuários com papel traduzido', () => {
    expect(
      mapUsersToSummaries([
        { id: 'u1', name: 'Ana', typeUser: 'STUDENT' },
      ]),
    ).toEqual([{ id: 'u1', name: 'Ana', role: 'Aluno' }])
  })
})
