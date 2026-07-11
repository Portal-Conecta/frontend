/// <reference types="vitest" />
import { describe, expect, it } from 'vitest'
import { canEditRoomMap } from '../../src/auth/canEditRoomMap'
import type { CurrentUser } from '@portal/core'

const CLASS_A = 'class-a'
const CLASS_B = 'class-b'

function makeUser(overrides: Partial<CurrentUser> = {}): CurrentUser {
  return {
    id: 'user-1',
    userType: 'STUDENT',
    classes: [],
    permissions: [],
    ...overrides,
  }
}

describe('canEditRoomMap', () => {
  it('retorna false quando usuário é null', () => {
    expect(canEditRoomMap(null, CLASS_A)).toBe(false)
  })

  it('ADMIN pode editar em qualquer turma', () => {
    const admin = makeUser({ userType: 'ADMIN', classes: [] })
    expect(canEditRoomMap(admin, CLASS_A)).toBe(true)
    expect(canEditRoomMap(admin, CLASS_B)).toBe(true)
  })

  it('TEACHER na turma pode editar', () => {
    const teacher = makeUser({
      userType: 'TEACHER',
      classes: [{ classId: CLASS_A, role: 'TEACHER' }],
    })
    expect(canEditRoomMap(teacher, CLASS_A)).toBe(true)
  })

  it('TEACHER em outra turma não pode editar', () => {
    const teacher = makeUser({
      userType: 'TEACHER',
      classes: [{ classId: CLASS_A, role: 'TEACHER' }],
    })
    expect(canEditRoomMap(teacher, CLASS_B)).toBe(false)
  })

  it('STUDENT não pode editar', () => {
    const student = makeUser({
      userType: 'STUDENT',
      classes: [{ classId: CLASS_A, role: 'STUDENT' }],
    })
    expect(canEditRoomMap(student, CLASS_A)).toBe(false)
  })

  it('REPRESENTATIVE não pode editar', () => {
    const rep = makeUser({
      userType: 'REPRESENTATIVE',
      classes: [{ classId: CLASS_A, role: 'REPRESENTATIVE' }],
    })
    expect(canEditRoomMap(rep, CLASS_A)).toBe(false)
  })

  it('SENAI sem vínculo TEACHER na turma não pode editar', () => {
    const senai = makeUser({ userType: 'SENAI', classes: [] })
    expect(canEditRoomMap(senai, CLASS_A)).toBe(false)
  })

  it('WEG sem vínculo TEACHER na turma não pode editar', () => {
    const weg = makeUser({ userType: 'WEG', classes: [] })
    expect(canEditRoomMap(weg, CLASS_A)).toBe(false)
  })
})
