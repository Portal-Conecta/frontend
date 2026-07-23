import { describe, expect, it } from 'vitest'

import { creatableTypeUsers } from '@portal/core/users/userCreatePermissions'

describe('creatableTypeUsers', () => {
  it('ADMIN pode criar qualquer tipo, exceto REPRESENTATIVE (#502)', () => {
    expect(creatableTypeUsers('ADMIN')).toEqual(['STUDENT', 'TEACHER', 'SENAI', 'WEG', 'ADMIN'])
  })

  it('REPRESENTATIVE não é criável por ninguém, nem ADMIN (#502)', () => {
    expect(creatableTypeUsers('ADMIN')).not.toContain('REPRESENTATIVE')
  })

  it('SENAI só cria Estudante e Professor', () => {
    expect(creatableTypeUsers('SENAI')).toEqual(['STUDENT', 'TEACHER'])
  })

  it('WEG só cria Estudante', () => {
    expect(creatableTypeUsers('WEG')).toEqual(['STUDENT'])
  })

  it('demais papéis não criam ninguém', () => {
    expect(creatableTypeUsers('STUDENT')).toEqual([])
    expect(creatableTypeUsers('TEACHER')).toEqual([])
    expect(creatableTypeUsers('REPRESENTATIVE')).toEqual([])
  })
})
