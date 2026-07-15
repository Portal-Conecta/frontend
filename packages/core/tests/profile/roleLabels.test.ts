import { describe, expect, it } from 'vitest'

import type { TypeUser } from '@portal/core/rbac'
import { ROLE_LABELS } from '@portal/core/profile/roleLabels'

const cases: [TypeUser, string][] = [
  ['STUDENT', 'Estudante'],
  ['TEACHER', 'Professor'],
  ['SENAI', 'SENAI'],
  ['WEG', 'WEG'],
  ['REPRESENTATIVE', 'Representante de Turma'],
  ['ADMIN', 'Administrador'],
]

describe('ROLE_LABELS', () => {
  it.each(cases)('mapeia %s para "%s"', (typeUser, label) => {
    expect(ROLE_LABELS[typeUser]).toBe(label)
  })
})
