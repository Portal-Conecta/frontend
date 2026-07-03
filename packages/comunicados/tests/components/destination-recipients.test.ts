/**
 * Testes dos helpers puros do modelo `Recipient` (DestinationSelector, #195).
 * Lógica sem React/DOM — roda em ambiente `node`.
 */
import { describe, expect, it } from 'vitest'

import {
  addRecipient,
  hasRecipient,
  makeRecipient,
  recipientKey,
  removeRecipient,
  toggleRecipient,
} from '../../src/components/DestinationSelector/types'

describe('recipientKey / makeRecipient', () => {
  it('monta a chave como `kind:refId`', () => {
    expect(recipientKey('course', 'curso-ds')).toBe('course:curso-ds')
  })

  it('makeRecipient preenche key/kind/refId/label', () => {
    expect(makeRecipient('user', 'u-01', 'Ana')).toEqual({
      key: 'user:u-01',
      kind: 'user',
      refId: 'u-01',
      label: 'Ana',
    })
  })
})

describe('addRecipient', () => {
  it('adiciona um novo destinatário', () => {
    const r = makeRecipient('class', 'turma-ds-2026', 'DS 2026')
    expect(addRecipient([], r)).toEqual([r])
  })

  it('não duplica quando a key já existe', () => {
    const r = makeRecipient('shift', 'turno-manha', 'Manhã')
    expect(addRecipient([r], r)).toEqual([r])
  })

  it('não muta a lista original', () => {
    const original = [makeRecipient('course', 'curso-ds', 'DS')]
    const next = addRecipient(original, makeRecipient('course', 'curso-adm', 'ADM'))
    expect(original).toHaveLength(1)
    expect(next).toHaveLength(2)
  })
})

describe('toggleRecipient', () => {
  it('adiciona quando ausente', () => {
    const r = makeRecipient('group', 'STUDENTS', 'Todos os Alunos')
    expect(toggleRecipient([], r)).toEqual([r])
  })

  it('remove quando já presente', () => {
    const r = makeRecipient('group', 'TEACHERS', 'Todos os Professores')
    expect(toggleRecipient([r], r)).toEqual([])
  })
})

describe('removeRecipient / hasRecipient', () => {
  it('remove pela key e reflete em hasRecipient', () => {
    const a = makeRecipient('user', 'u-01', 'Ana')
    const b = makeRecipient('user', 'u-02', 'Bruno')
    const list = [a, b]

    expect(hasRecipient(list, a.key)).toBe(true)

    const next = removeRecipient(list, a.key)
    expect(next).toEqual([b])
    expect(hasRecipient(next, a.key)).toBe(false)
  })
})
