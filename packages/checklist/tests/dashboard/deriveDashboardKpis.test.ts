import { describe, expect, it } from 'vitest'

import { MOCK_DASHBOARD_STATS } from '../../src/components/dashboard/data/mockDashboardStats'
import { deriveDashboardKpis } from '../../src/components/dashboard/kpis/deriveDashboardKpis'
import { statsToChartData } from '../../src/components/dashboard/charts/statsToChartData'
import {
  parseTaxaConclusao,
  taxaConclusaoToChartEntries,
} from '../../src/components/dashboard/charts/taxaConclusao'

describe('deriveDashboardKpis', () => {
  it('deriva 4 KPIs a partir do payload do dashboard (ratePercent)', () => {
    const kpis = deriveDashboardKpis(MOCK_DASHBOARD_STATS)
    expect(kpis).toHaveLength(4)
    expect(kpis.map((k) => k.id)).toEqual([
      'taxa-conclusao',
      'execucoes',
      'pendencias',
      'conformidade-atual',
    ])
    // ratePercent 77.8 do mock
    expect(kpis[0]!.value).toBe('77,8%')
    expect(kpis[0]!.hint).toContain('42')
    expect(kpis[0]!.hint).toContain('54')
    // execuções por status: 42+12+5
    expect(kpis[1]!.value).toBe('59')
    // issues: 15+8+21+3
    expect(kpis[2]!.value).toBe('47')
    // última semana da tendência (91) vs anterior (88.2) = +2,8
    expect(kpis[3]!.value).toBe('91%')
    expect(kpis[3]!.hint).toBe('+2,8 pts vs semana anterior')
  })

  it('não inclui KPI de conformidade quando a tendência vem vazia', () => {
    const kpis = deriveDashboardKpis({
      ...MOCK_DASHBOARD_STATS,
      tendenciaConformidade: [],
    })
    expect(kpis.map((k) => k.id)).not.toContain('conformidade-atual')
  })

  it('usa ratePercent 0 com total 0 (payload vazio real)', () => {
    const kpis = deriveDashboardKpis({
      ...MOCK_DASHBOARD_STATS,
      execucoesPorStatus: [],
      taxaConclusao: [
        { label: 'submitted', value: 0 },
        { label: 'total', value: 0 },
        { label: 'ratePercent', value: 0 },
      ],
      issuesPorStatus: [],
      issuesPorPrioridade: [],
    })
    expect(kpis[0]!.value).toBe('0%')
    expect(kpis[1]!.value).toBe('0')
  })
})

describe('taxaConclusao', () => {
  it('parseTaxaConclusao lê labels do backend', () => {
    const parsed = parseTaxaConclusao(MOCK_DASHBOARD_STATS.taxaConclusao)
    expect(parsed).toEqual({ submitted: 42, total: 54, ratePercent: 77.8 })
  })

  it('taxaConclusaoToChartEntries não inclui ratePercent', () => {
    const chart = taxaConclusaoToChartEntries(MOCK_DASHBOARD_STATS.taxaConclusao)
    expect(chart).toEqual([
      { label: 'Submetidas', value: 42 },
      { label: 'Não submetidas', value: 12 },
    ])
  })

  it('taxaConclusaoToChartEntries retorna vazio quando total=0', () => {
    expect(
      taxaConclusaoToChartEntries([
        { label: 'submitted', value: 0 },
        { label: 'total', value: 0 },
        { label: 'ratePercent', value: 0 },
      ]),
    ).toEqual([])
  })
})

describe('statsToChartData preserveOrder', () => {
  it('mantém ordem cronológica da série temporal', () => {
    const chart = statsToChartData(
      [
        { label: '01/06', value: 1 },
        { label: '02/06', value: 9 },
        { label: '03/06', value: 3 },
      ],
      { preserveOrder: true },
    )
    expect(chart.labels).toEqual(['01/06', '02/06', '03/06'])
    expect(chart.values).toEqual([1, 9, 3])
  })
})
