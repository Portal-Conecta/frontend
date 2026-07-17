'use client'

import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  ChartCard,
  dsBarDatasetDefaults,
  makeDsChartOptions,
  registerBarCharts,
  useDsChartTheme,
} from '@portal/ui'

import type { StatsEntry } from '../../../types/dashboard'
import { isEmptyStats, statsToChartData } from './statsToChartData'

registerBarCharts()

export interface DsBarChartProps {
  title: string
  data: StatsEntry[]
  loading?: boolean
  height?: number
  datasetLabel?: string
  horizontal?: boolean
  statusSemantics?: boolean
}

export function DsBarChart({
  title,
  data,
  loading = false,
  height = 280,
  datasetLabel = 'Total',
  horizontal = false,
  statusSemantics = false,
}: DsBarChartProps) {
  const theme = useDsChartTheme()
  const chart = useMemo(
    () => statsToChartData(data, { statusSemantics }),
    [data, statusSemantics],
  )
  const empty = !loading && isEmptyStats(data)

  const chartData = useMemo(
    () => ({
      labels: chart.labels,
      datasets: [
        {
          label: datasetLabel,
          data: chart.values,
          backgroundColor: chart.colors,
          borderColor: chart.colors,
          ...dsBarDatasetDefaults(),
        },
      ],
    }),
    [chart, datasetLabel],
  )

  const options = useMemo(
    () =>
      makeDsChartOptions<'bar'>(theme, 'bar', {
        seriesCount: 1,
        indexAxis: horizontal ? 'y' : 'x',
        ariaLabel: title,
      }),
    [theme, title, horizontal],
  )

  return (
    <ChartCard title={title} height={height} loading={loading} empty={empty}>
      <Bar data={chartData} options={options} />
    </ChartCard>
  )
}
