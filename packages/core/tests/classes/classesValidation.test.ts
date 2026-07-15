import { describe, expect, it } from 'vitest'

import { parseCreateClass } from '@portal/core/classes/classesValidation'

describe('parseCreateClass', () => {
  it('aceita curso, número e turno válidos (normaliza o courseId)', () => {
    const result = parseCreateClass({
      courseId: '  550e8400-e29b-41d4-a716-446655440000  ',
      number: 78,
      shift: 'FULL_AM_PM',
    })
    expect(result).toEqual({
      ok: true,
      value: {
        courseId: '550e8400-e29b-41d4-a716-446655440000',
        number: 78,
        shift: 'FULL_AM_PM',
      },
    })
  })

  it('exige curso, número e turno', () => {
    const result = parseCreateClass({})
    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('esperava falha')
    expect(result.errors).toEqual([
      { field: 'courseId', message: 'Curso é obrigatório.' },
      { field: 'number', message: 'Número é obrigatório.' },
      { field: 'shift', message: 'Turno é obrigatório.' },
    ])
  })

  it('rejeita courseId só com espaços', () => {
    const result = parseCreateClass({ courseId: '   ', number: 1, shift: 'FULL_AM_PM' })
    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('esperava falha')
    expect(result.errors).toEqual([{ field: 'courseId', message: 'Curso é obrigatório.' }])
  })

  it('rejeita número não-inteiro, ≤ 0 ou string numérica', () => {
    const invalidNumbers = [0, -1, 1.5, '78', null]
    for (const number of invalidNumbers) {
      const result = parseCreateClass({ courseId: 'c1', number, shift: 'FULL_AM_PM' })
      expect(result.ok, `number=${String(number)}`).toBe(false)
    }
  })

  it('mensagem específica para número inválido (não só ausente)', () => {
    const result = parseCreateClass({ courseId: 'c1', number: 0, shift: 'FULL_AM_PM' })
    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('esperava falha')
    expect(result.errors).toEqual([
      { field: 'number', message: 'Número deve ser um inteiro maior ou igual a 1.' },
    ])
  })

  it('rejeita turno fora do enum', () => {
    const result = parseCreateClass({ courseId: 'c1', number: 1, shift: 'MANHA' })
    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('esperava falha')
    expect(result.errors[0]).toMatchObject({ field: 'shift' })
    expect(result.errors[0]!.message).toContain('FULL_AM_PM')
  })

  it('aceita o outro turno do enum', () => {
    const result = parseCreateClass({ courseId: 'c1', number: 1, shift: 'FULL_PM_NT' })
    expect(result.ok).toBe(true)
  })
})
