import { describe, expect, it } from 'vitest'

import { humanizeStatsLabel } from '../../src/components/dashboard/charts/statsLabels'
import {
  isDashboardEmpty,
  statsToChartData,
} from '../../src/components/dashboard/charts/statsToChartData'
import {
  defaultDashboardPeriod,
  formatIsoDatePt,
  validateDashboardPeriod,
} from '../../src/components/dashboard/period'

describe('humanizeStatsLabel', () => {
  it('traduz enums do backend', () => {
    expect(humanizeStatsLabel('SUBMITTED')).toBe('Submetidas')
    expect(humanizeStatsLabel('DRAFT')).toBe('Rascunho')
    expect(humanizeStatsLabel('IN_PROGRESS')).toBe('Em andamento')
    expect(humanizeStatsLabel('HIGH')).toBe('Alta')
    expect(humanizeStatsLabel('Sala 12')).toBe('Sala 12')
  })
})

describe('statsToChartData labels', () => {
  it('humaniza labels no output do gráfico', () => {
    const chart = statsToChartData(
      [
        { label: 'SUBMITTED', value: 10 },
        { label: 'DRAFT', value: 2 },
      ],
      { statusSemantics: true },
    )
    expect(chart.labels).toEqual(['Submetidas', 'Rascunho'])
  })

  it('prioritySemantics pinta HIGH com cor de erro', () => {
    const chart = statsToChartData(
      [
        { label: 'HIGH', value: 5 },
        { label: 'LOW', value: 1 },
      ],
      { prioritySemantics: true },
    )
    expect(chart.labels[0]).toBe('Alta')
    expect(chart.colors[0]).toBeTruthy()
    expect(chart.colors[0]).not.toBe(chart.colors[1])
  })
})

describe('isDashboardEmpty', () => {
  it('detecta payload real zerado', () => {
    expect(
      isDashboardEmpty({
        execucoesPorDia: [],
        execucoesPorStatus: [],
        taxaConclusao: [
          { label: 'submitted', value: 0 },
          { label: 'total', value: 0 },
          { label: 'ratePercent', value: 0 },
        ],
        issuesPorStatus: [],
        issuesPorPrioridade: [],
        issuesPorDia: [],
      }),
    ).toBe(true)
  })

  it('não é vazio com série temporal', () => {
    expect(
      isDashboardEmpty({
        execucoesPorDia: [{ label: '01/06', value: 1 }],
        execucoesPorStatus: [],
        taxaConclusao: [],
        issuesPorStatus: [],
        issuesPorPrioridade: [],
        issuesPorDia: [],
      }),
    ).toBe(false)
  })
})

describe('period helpers', () => {
  it('formatIsoDatePt', () => {
    expect(formatIsoDatePt('2026-06-17')).toBe('17/06/2026')
  })

  it('validateDashboardPeriod', () => {
    expect(validateDashboardPeriod('2026-06-01', '2026-05-01').ok).toBe(false)
    expect(validateDashboardPeriod('2026-01-01', '2026-01-31').ok).toBe(true)
  })

  it('defaultDashboardPeriod tem from <= to', () => {
    const p = defaultDashboardPeriod(30)
    expect(p.from <= p.to).toBe(true)
    expect(p.from).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
