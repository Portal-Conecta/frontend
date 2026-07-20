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
})

describe('parseUpdateUser', () => {
  it('aceita atualização parcial e normaliza os textos', () => {
    expect(parseUpdateUser({ name: '  Ana  ', email: ' ana@weg.net ' })).toEqual({
      ok: true,
      value: { name: 'Ana', email: 'ana@weg.net' },
    })
  })

  it('exige ao menos um campo e rejeita valores inválidos', () => {
    expect(parseUpdateUser({})).toEqual({
      ok: false,
      errors: [{ field: 'body', message: 'Informe ao menos um campo para atualizar.' }],
    })
    expect(parseUpdateUser({ name: ' ', email: 'invalido' }).ok).toBe(false)
  })
})
