import { describe, expect, it } from 'vitest'

import { parseCreateUser, parseUpdateUser } from '@portal/core/profile/profileValidation'

describe('parseCreateUser', () => {
  it('aceita e normaliza os campos obrigatórios', () => {
    expect(
      parseCreateUser({ name: '  Ana Silva  ', email: '  ana@weg.net  ', typeUser: 'WEG' }),
    ).toEqual({
      ok: true,
      value: { name: 'Ana Silva', email: 'ana@weg.net', typeUser: 'WEG' },
    })
  })

  it('exige nome, e-mail e tipo', () => {
    const result = parseCreateUser({})
    expect(result).toEqual({
      ok: false,
      errors: [
        { field: 'name', message: 'Nome é obrigatório.' },
        { field: 'email', message: 'E-mail é obrigatório.' },
        { field: 'typeUser', message: 'Tipo é obrigatório.' },
      ],
    })
  })

  it('rejeita e-mail inválido e tipo desconhecido', () => {
    const result = parseCreateUser({ name: 'Ana', email: 'ana', typeUser: 'MANAGER' })
    expect(result).toEqual({
      ok: false,
      errors: [
        { field: 'email', message: 'E-mail deve ser válido.' },
        expect.objectContaining({ field: 'typeUser' }),
      ],
    })
  })

  it('rejeita REPRESENTATIVE — não é criável diretamente (#502), só via promoção de STUDENT numa turma', () => {
    const result = parseCreateUser({ name: 'Ana', email: 'ana@weg.net', typeUser: 'REPRESENTATIVE' })
    expect(result).toEqual({
      ok: false,
      errors: [{ field: 'typeUser', message: 'Representante não pode ser criado diretamente.' }],
    })
  })
})

describe('parseUpdateUser', () => {
  it('aceita apenas o nome e normaliza o texto', () => {
    expect(parseUpdateUser({ name: '  Ana  ' })).toEqual({
      ok: true,
      value: { name: 'Ana' },
    })
  })

  it('exige ao menos um campo e rejeita valores inválidos', () => {
    expect(parseUpdateUser({})).toEqual({
      ok: false,
      errors: [{ field: 'body', message: 'Informe ao menos um campo para atualizar.' }],
    })
    expect(parseUpdateUser({ name: ' ' }).ok).toBe(false)
  })

  it('rejeita campos que o Hub não suporta, mesmo com nome válido', () => {
    expect(parseUpdateUser({ name: 'Ana', email: 'ana@weg.net' })).toEqual({
      ok: false,
      errors: [{ field: 'email', message: 'Campo não suportado na atualização: email.' }],
    })
  })
})
