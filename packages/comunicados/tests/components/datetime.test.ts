import { describe, expect, it } from 'vitest'

import {
  combineToIso,
  formatBrasiliaDate,
  formatBrasiliaTime,
  isFutureIso,
  isoToLocalDate,
  isoToLocalTime,
  defaultScheduleBrasilia,
  resolveScheduleDefaults,
  todayLocalDate,
} from '../../src/utils/datetime'

/** Instante fixo: 2026-06-30 14:00 em Brasília (17:00 UTC). */
const BRT_14H_UTC = '2026-06-30T17:00:00.000Z'

describe('combineToIso', () => {
  it('interpreta data/hora como horário de Brasília e converte para UTC', () => {
    expect(combineToIso('2026-06-30', '14:00')).toBe(BRT_14H_UTC)
  })

  it('faz round-trip data/hora de Brasília ↔ ISO', () => {
    const iso = combineToIso('2026-06-30', '14:00')
    expect(iso).not.toBeNull()
    expect(isoToLocalDate(iso)).toBe('2026-06-30')
    expect(isoToLocalTime(iso)).toBe('14:00')
  })

  it('retorna null enquanto data ou hora estão vazias', () => {
    expect(combineToIso('', '14:00')).toBeNull()
    expect(combineToIso('2026-06-30', '')).toBeNull()
    expect(combineToIso('', '')).toBeNull()
  })

  it('retorna null para entrada inválida', () => {
    expect(combineToIso('não-é-data', '14:00')).toBeNull()
    expect(combineToIso('2026-06-30', 'xx:yy')).toBeNull()
  })
})

describe('isoToLocalDate / isoToLocalTime', () => {
  it('formata instante UTC em data/hora de Brasília', () => {
    expect(isoToLocalDate(BRT_14H_UTC)).toBe('2026-06-30')
    expect(isoToLocalTime(BRT_14H_UTC)).toBe('14:00')
  })

  it('retorna string vazia para null ou ISO inválido', () => {
    expect(isoToLocalDate(null)).toBe('')
    expect(isoToLocalTime(null)).toBe('')
    expect(isoToLocalDate('não-é-iso')).toBe('')
    expect(isoToLocalTime('não-é-iso')).toBe('')
  })
})

describe('defaultScheduleBrasilia / resolveScheduleDefaults', () => {
  /** 2026-07-06 19:45 BRT = 2026-07-06T22:45:00.000Z */
  const fixed = new Date('2026-07-06T22:45:00.000Z')

  it('defaultScheduleBrasilia retorna meia-noite do dia seguinte em Brasília', () => {
    expect(defaultScheduleBrasilia(fixed)).toEqual({ date: '2026-07-07', time: '00:00' })
  })

  it('resolveScheduleDefaults preenche campos vazios com meia-noite de amanhã', () => {
    expect(resolveScheduleDefaults('', '', fixed)).toEqual({ date: '2026-07-07', time: '00:00' })
  })

  it('defaultScheduleBrasilia avança o calendário no virar do ano', () => {
    const newYearsEve = new Date('2026-01-01T02:00:00.000Z') // 2025-12-31 23:00 BRT
    expect(defaultScheduleBrasilia(newYearsEve)).toEqual({ date: '2026-01-01', time: '00:00' })
  })

  it('resolveScheduleDefaults preserva valores já preenchidos', () => {
    expect(resolveScheduleDefaults('2026-08-01', '10:30', fixed)).toEqual({
      date: '2026-08-01',
      time: '10:30',
    })
  })
})

describe('isFutureIso', () => {
  const now = Date.parse('2026-06-30T12:00:00.000Z')

  it('é true só quando o instante está estritamente no futuro', () => {
    expect(isFutureIso('2026-06-30T12:00:01.000Z', now)).toBe(true)
    expect(isFutureIso('2026-06-30T12:00:00.000Z', now)).toBe(false)
    expect(isFutureIso('2026-06-30T11:59:59.000Z', now)).toBe(false)
  })

  it('é false para null ou ISO inválido', () => {
    expect(isFutureIso(null, now)).toBe(false)
    expect(isFutureIso('não-é-iso', now)).toBe(false)
  })
})

describe('todayLocalDate / formatBrasilia', () => {
  it('todayLocalDate formata a data de hoje em Brasília', () => {
    expect(todayLocalDate(new Date('2026-01-05T12:00:00.000Z'))).toBe('2026-01-05')
    expect(todayLocalDate(new Date('2026-12-31T12:00:00.000Z'))).toBe('2026-12-31')
  })

  it('formatBrasiliaDate e formatBrasiliaTime usam o fuso de Brasília', () => {
    const instant = new Date('2026-06-30T17:00:00.000Z')
    expect(formatBrasiliaDate(instant)).toBe('2026-06-30')
    expect(formatBrasiliaTime(instant)).toBe('14:00')
  })
})
