import { describe, expect, it } from 'vitest'

import { clampDataFim, clampDataInicio } from '../../src/components/AnnouncementFiltersBar/dateRange'

describe('clampDataFim', () => {
  it('iguala à inicial quando a final é anterior', () => {
    expect(clampDataFim('2026-07-01', '2026-07-14')).toBe('2026-07-14')
  })

  it('mantém a final quando é posterior à inicial', () => {
    expect(clampDataFim('2026-07-20', '2026-07-14')).toBe('2026-07-20')
  })

  it('mantém a final quando já é igual à inicial', () => {
    expect(clampDataFim('2026-07-14', '2026-07-14')).toBe('2026-07-14')
  })

  it('não inventa valor quando a final está vazia', () => {
    expect(clampDataFim('', '2026-07-14')).toBe('')
  })

  it('deixa a final passar quando não há inicial para comparar', () => {
    expect(clampDataFim('2026-07-01', '')).toBe('2026-07-01')
  })

  it('compara por calendário na virada de ano', () => {
    expect(clampDataFim('2025-12-31', '2026-01-01')).toBe('2026-01-01')
  })
})

describe('clampDataInicio', () => {
  it('iguala à final quando a inicial é posterior', () => {
    expect(clampDataInicio('2026-07-20', '2026-07-14')).toBe('2026-07-14')
  })

  it('mantém a inicial quando é anterior à final', () => {
    expect(clampDataInicio('2026-07-01', '2026-07-14')).toBe('2026-07-01')
  })

  it('mantém a inicial quando já é igual à final', () => {
    expect(clampDataInicio('2026-07-14', '2026-07-14')).toBe('2026-07-14')
  })

  it('não inventa valor quando a inicial está vazia', () => {
    expect(clampDataInicio('', '2026-07-14')).toBe('')
  })

  it('deixa a inicial passar quando não há final para comparar', () => {
    expect(clampDataInicio('2026-07-20', '')).toBe('2026-07-20')
  })

  it('compara por calendário na virada de ano', () => {
    expect(clampDataInicio('2026-01-01', '2025-12-31')).toBe('2025-12-31')
  })
})

describe('intervalo nunca sai invertido', () => {
  it('qualquer combinação resulta em inicial <= final', () => {
    const datas = ['2025-12-31', '2026-01-01', '2026-07-14', '2026-07-20', '']

    for (const inicio of datas) {
      for (const fim of datas) {
        expect(clampDataFim(fim, inicio) >= inicio || !fim || !inicio).toBe(true)
        expect(clampDataInicio(inicio, fim) <= fim || !fim || !inicio).toBe(true)
      }
    }
  })
})
