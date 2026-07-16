'use client'

import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  ChartCard,
  dsLineDatasetDefaults,
  makeDsChartOptions,
  registerLineCharts,
  useDsChartTheme,
} from '@portal/ui'

import type { StatsEntry } from '../../types/dashboard'
import { isEmptyStats, statsToChartData } from './statsToChartData'

registerLineCharts()

export interface DsLineChartProps {
  title: string
  data: StatsEntry[]
  loading?: boolean
  height?: number
  datasetLabel?: string
}

export function DsLineChart({
  title,
  data,
  loading = false,
  height = 280,
  datasetLabel = 'Total',
}: DsLineChartProps) {
  const theme = useDsChartTheme()
  const chart = useMemo(() => statsToChartData(data), [data])
  const empty = !loading && isEmptyStats(data)

  const chartData = useMemo(
    () => ({
      labels: chart.labels,
      datasets: [
        {
          label: datasetLabel,
          data: chart.values,
          borderColor: chart.colors[0] ?? theme.textBrand,
          backgroundColor: chart.colors[0] ?? theme.textBrand,
          ...dsLineDatasetDefaults(theme),
        },
      ],
    }),
    [chart, datasetLabel, theme],
  )

  const options = useMemo(
    () =>
      makeDsChartOptions<'line'>(theme, 'line', {
        seriesCount: 1,
        ariaLabel: title,
      }),
    [theme, title],
  )

  return (
    <ChartCard title={title} height={height} loading={loading} empty={empty}>
      <Line data={chartData} options={options} />
    </ChartCard>
  )
}
