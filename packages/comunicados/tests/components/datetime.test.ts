import { describe, expect, it } from 'vitest'

import {
  combineToIso,
  isFutureIso,
  isoToLocalDate,
  isoToLocalTime,
  todayLocalDate,
} from '../../src/components/ScheduleDatePicker/datetime'

describe('combineToIso', () => {
  it('faz round-trip data/hora local ↔ ISO sem depender do fuso do runner', () => {
    const iso = combineToIso('2026-06-30', '14:00')
    expect(iso).not.toBeNull()
    expect(iso!.endsWith('Z')).toBe(true)
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
  it('retorna string vazia para null ou ISO inválido', () => {
    expect(isoToLocalDate(null)).toBe('')
    expect(isoToLocalTime(null)).toBe('')
    expect(isoToLocalDate('não-é-iso')).toBe('')
    expect(isoToLocalTime('não-é-iso')).toBe('')
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

describe('todayLocalDate', () => {
  it('formata yyyy-mm-dd com zero à esquerda', () => {
    expect(todayLocalDate(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(todayLocalDate(new Date(2026, 11, 31))).toBe('2026-12-31')
  })
})
