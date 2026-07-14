import { describe, expect, it } from 'vitest'

import {
  parseCreateCourse,
  parseCreateCourseBatch,
  parseUpdateCourse,
} from '@portal/core/courses/coursesValidation'

describe('parseCreateCourse', () => {
  it('aceita e normaliza (trim) código e nome', () => {
    const result = parseCreateCourse({ code: '  DEV-01  ', name: '  Desenvolvimento  ' })
    expect(result).toEqual({ ok: true, value: { code: 'DEV-01', name: 'Desenvolvimento' } })
  })

  it('exige código e nome', () => {
    const result = parseCreateCourse({})
    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('esperava falha')
    expect(result.errors).toEqual([
      { field: 'code', message: 'Código é obrigatório.' },
      { field: 'name', message: 'Nome é obrigatório.' },
    ])
  })

  it('rejeita string só com espaços', () => {
    const result = parseCreateCourse({ code: '   ', name: 'X' })
    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('esperava falha')
    expect(result.errors).toEqual([{ field: 'code', message: 'Código é obrigatório.' }])
  })

  it('rejeita tipos não-string', () => {
    const result = parseCreateCourse({ code: 42, name: null })
    expect(result.ok).toBe(false)
  })
})

describe('parseCreateCourseBatch', () => {
  it('normaliza todos os itens quando válidos', () => {
    const result = parseCreateCourseBatch([
      { code: 'A', name: 'Curso A' },
      { code: '  B  ', name: 'Curso B' },
    ])
    expect(result).toEqual({
      ok: true,
      values: [
        { code: 'A', name: 'Curso A' },
        { code: 'B', name: 'Curso B' },
      ],
    })
  })

  it('reprova o lote inteiro e reporta erros por índice', () => {
    const result = parseCreateCourseBatch([
      { code: 'A', name: 'Curso A' },
      { code: '', name: 'Curso B' },
    ])
    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('esperava falha')
    expect(result.errors).toEqual([
      { index: 1, errors: [{ field: 'code', message: 'Código é obrigatório.' }] },
    ])
  })

  it('rejeita corpo que não é array', () => {
    const result = parseCreateCourseBatch({ code: 'A', name: 'B' })
    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('esperava falha')
    expect(result.errors[0]!.index).toBe(-1)
  })

  it('rejeita array vazio', () => {
    const result = parseCreateCourseBatch([])
    expect(result.ok).toBe(false)
  })
})

describe('parseUpdateCourse', () => {
  it('aceita apenas o código', () => {
    expect(parseUpdateCourse({ code: ' RED-02 ' })).toEqual({ ok: true, value: { code: 'RED-02' } })
  })

  it('aceita apenas o nome', () => {
    expect(parseUpdateCourse({ name: 'Redes' })).toEqual({ ok: true, value: { name: 'Redes' } })
  })

  it('exige ao menos um campo', () => {
    const result = parseUpdateCourse({})
    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('esperava falha')
    expect(result.errors).toEqual([
      { field: 'form', message: 'Informe ao menos um campo para atualizar.' },
    ])
  })

  it('rejeita campo presente mas vazio', () => {
    const result = parseUpdateCourse({ name: '   ' })
    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('esperava falha')
    expect(result.errors).toEqual([{ field: 'name', message: 'Nome não pode ser vazio.' }])
  })
})
