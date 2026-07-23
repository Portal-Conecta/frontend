import { describe, expect, it } from 'vitest'

import { canManageUserType } from '@portal/core/users/userManagePermissions'

describe('canManageUserType', () => {
  it('ADMIN gerencia qualquer tipo', () => {
    expect(canManageUserType('ADMIN', 'STUDENT')).toBe(true)
    expect(canManageUserType('ADMIN', 'REPRESENTATIVE')).toBe(true)
    expect(canManageUserType('ADMIN', 'TEACHER')).toBe(true)
    expect(canManageUserType('ADMIN', 'SENAI')).toBe(true)
    expect(canManageUserType('ADMIN', 'WEG')).toBe(true)
    expect(canManageUserType('ADMIN', 'ADMIN')).toBe(true)
  })

  it('SENAI gerencia Estudante, Representante e Professor', () => {
    expect(canManageUserType('SENAI', 'STUDENT')).toBe(true)
    expect(canManageUserType('SENAI', 'REPRESENTATIVE')).toBe(true)
    expect(canManageUserType('SENAI', 'TEACHER')).toBe(true)
    expect(canManageUserType('SENAI', 'SENAI')).toBe(false)
    expect(canManageUserType('SENAI', 'WEG')).toBe(false)
    expect(canManageUserType('SENAI', 'ADMIN')).toBe(false)
  })

  it('WEG gerencia Estudante, Representante e Professor', () => {
    expect(canManageUserType('WEG', 'STUDENT')).toBe(true)
    expect(canManageUserType('WEG', 'REPRESENTATIVE')).toBe(true)
    expect(canManageUserType('WEG', 'TEACHER')).toBe(true)
    expect(canManageUserType('WEG', 'SENAI')).toBe(false)
    expect(canManageUserType('WEG', 'WEG')).toBe(false)
    expect(canManageUserType('WEG', 'ADMIN')).toBe(false)
  })

  it('demais papéis não gerenciam ninguém', () => {
    expect(canManageUserType('STUDENT', 'STUDENT')).toBe(false)
    expect(canManageUserType('TEACHER', 'STUDENT')).toBe(false)
    expect(canManageUserType('REPRESENTATIVE', 'STUDENT')).toBe(false)
  })
})
