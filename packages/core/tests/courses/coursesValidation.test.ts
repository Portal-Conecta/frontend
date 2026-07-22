import { describe, expect, it } from 'vitest'

import {
  MAX_CODE_LENGTH,
  MAX_CREATE_BATCH,
  MAX_NAME_LENGTH,
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

  it('rejeita código acima do teto de tamanho', () => {
    const result = parseCreateCourse({ code: 'C'.repeat(MAX_CODE_LENGTH + 1), name: 'Curso' })
    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('esperava falha')
    expect(result.errors).toEqual([
      { field: 'code', message: `Código deve ter no máximo ${MAX_CODE_LENGTH} caracteres.` },
    ])
  })

  it('rejeita nome acima do teto de tamanho', () => {
    const result = parseCreateCourse({ code: 'C', name: 'N'.repeat(MAX_NAME_LENGTH + 1) })
    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('esperava falha')
    expect(result.errors).toEqual([
      { field: 'name', message: `Nome deve ter no máximo ${MAX_NAME_LENGTH} caracteres.` },
    ])
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

  it(`aceita exatamente ${MAX_CREATE_BATCH} itens`, () => {
    const items = Array.from({ length: MAX_CREATE_BATCH }, (_, i) => ({
      code: `C${i}`,
      name: `Curso ${i}`,
    }))
    expect(parseCreateCourseBatch(items).ok).toBe(true)
  })

  it(`rejeita lote acima de ${MAX_CREATE_BATCH} itens`, () => {
    const items = Array.from({ length: MAX_CREATE_BATCH + 1 }, (_, i) => ({
      code: `C${i}`,
      name: `Curso ${i}`,
    }))
    const result = parseCreateCourseBatch(items)
    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('esperava falha')
    expect(result.errors[0]!.index).toBe(-1)
    expect(result.errors[0]!.errors[0]!.message).toContain(String(MAX_CREATE_BATCH))
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

  it('rejeita campo presente acima do teto de tamanho', () => {
    const result = parseUpdateCourse({ code: 'C'.repeat(MAX_CODE_LENGTH + 1) })
    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('esperava falha')
    expect(result.errors).toEqual([
      { field: 'code', message: `Código deve ter no máximo ${MAX_CODE_LENGTH} caracteres.` },
    ])
  })
})
