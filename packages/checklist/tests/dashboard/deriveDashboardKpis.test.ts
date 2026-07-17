import { describe, expect, it } from 'vitest'

import { MOCK_DASHBOARD_STATS } from '../../src/components/dashboard/data/mockDashboardStats'
import { deriveDashboardKpis } from '../../src/components/dashboard/kpis/deriveDashboardKpis'
import { statsToChartData } from '../../src/components/dashboard/charts/statsToChartData'

describe('deriveDashboardKpis', () => {
  it('deriva 4 KPIs a partir do payload do dashboard', () => {
    const kpis = deriveDashboardKpis(MOCK_DASHBOARD_STATS)
    expect(kpis).toHaveLength(4)
    expect(kpis.map((k) => k.id)).toEqual([
      'taxa-conclusao',
      'execucoes',
      'pendencias',
      'prioridade-alta',
    ])
    expect(kpis[0]!.value).toBe('78%')
    expect(kpis[1]!.value).toBe('59')
    expect(kpis[2]!.value).toBe('47')
    expect(kpis[3]!.value).toBe('9')
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
