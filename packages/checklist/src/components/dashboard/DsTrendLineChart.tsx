'use client'

import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  ChartCard,
  DS_CATEGORICAL,
  dsLineDatasetDefaults,
  makeDsChartOptions,
  registerLineCharts,
  useDsChartTheme,
} from '@portal/ui'

import {
  TENDENCIA_CONFORMIDADE_LABELS,
  TENDENCIA_CONFORMIDADE_VALUES,
  TENDENCIA_META,
} from './dashboardDemoData'

registerLineCharts()

export interface DsTrendLineChartProps {
  loading?: boolean
  height?: number
}

export function DsTrendLineChart({ loading = false, height = 300 }: DsTrendLineChartProps) {
  const theme = useDsChartTheme()
  const brand = DS_CATEGORICAL[0] ?? theme.textBrand

  const chartData = useMemo(
    () => ({
      labels: [...TENDENCIA_CONFORMIDADE_LABELS],
      datasets: [
        {
          label: 'Conformidade',
          data: [...TENDENCIA_CONFORMIDADE_VALUES],
          borderColor: brand,
          backgroundColor: brand,
          ...dsLineDatasetDefaults(theme),
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Meta 90%',
          data: TENDENCIA_CONFORMIDADE_LABELS.map(() => TENDENCIA_META),
          borderColor: theme.textMuted,
          backgroundColor: theme.textMuted,
          borderDash: [6, 4],
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: false,
          tension: 0,
        },
      ],
    }),
    [theme, brand],
  )

  const options = useMemo(
    () =>
      makeDsChartOptions<'line'>(theme, 'line', {
        seriesCount: 2,
        ariaLabel: 'Tendência de conformidade',
        overrides: {
          scales: {
            y: {
              min: 70,
              max: 100,
              ticks: {
                callback: (v: string | number) => `${v}%`,
              },
            },
          },
        },
      }),
    [theme],
  )

  return (
    <ChartCard
      title="Tendência de Conformidade"
      height={height}
      loading={loading}
      action={
        <span className="rounded-full bg-background-default px-2 py-1 text-label-xs text-text-secondary">
          Meta 90%
        </span>
      }
    >
      <Line data={chartData} options={options} />
    </ChartCard>
  )
}
