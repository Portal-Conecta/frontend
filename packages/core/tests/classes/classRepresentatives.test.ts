import { describe, expect, it } from 'vitest'

import {
  CLASS_REPRESENTATIVE_LIMIT,
  CLASS_REPRESENTATIVE_LIMIT_MESSAGE,
  getRepresentativeCandidateStudents,
  getRepresentativeMembers,
  hasRepresentativeLimitReached,
} from '@portal/core/classes/classRepresentatives'
import type { ClassMember } from '@portal/core/classes/types'

const members: ClassMember[] = [
  { id: 'student-1', name: 'Ana Silva', role: 'STUDENT' },
  { id: 'student-2', name: 'Bruno Costa', role: 'STUDENT' },
  { id: 'teacher-1', name: 'Carla Souza', role: 'TEACHER' },
  { id: 'representative-1', name: 'Diego Lima', role: 'REPRESENTATIVE' },
]

describe('class representatives rules', () => {
  it('mantem apenas alunos como candidatos a representante', () => {
    expect(getRepresentativeCandidateStudents(members).map((member) => member.id)).toEqual([
      'student-1',
      'student-2',
    ])
  })

  it('remove da lista de candidatos quem ja e representante', () => {
    const representatives: ClassMember[] = [{ id: 'student-1', name: 'Ana Silva', role: 'REPRESENTATIVE' }]

    expect(getRepresentativeCandidateStudents(members, representatives).map((member) => member.id)).toEqual([
      'student-2',
    ])
  })

  it('identifica os representantes atuais', () => {
    expect(getRepresentativeMembers(members)).toEqual([
      { id: 'representative-1', name: 'Diego Lima', role: 'REPRESENTATIVE' },
    ])
  })

  it('bloqueia novas escolhas quando ja existem 2 representantes', () => {
    const representatives: ClassMember[] = [
      { id: 'representative-1', name: 'Diego Lima', role: 'REPRESENTATIVE' },
      { id: 'representative-2', name: 'Erica Rocha', role: 'REPRESENTATIVE' },
    ]

    expect(CLASS_REPRESENTATIVE_LIMIT).toBe(2)
    expect(hasRepresentativeLimitReached(representatives)).toBe(true)
    expect(CLASS_REPRESENTATIVE_LIMIT_MESSAGE).toBe(
      'Remova os representantes da lista e selecione outros 2 representantes',
    )
  })
})
