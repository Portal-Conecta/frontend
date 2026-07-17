import {
  DS_CATEGORICAL,
  DS_MAX_CATEGORIES,
  DS_STATUS_COLORS,
  colorForEntity,
} from '@portal/ui'

import type { StatsEntry } from '../../../types/dashboard'

export interface ChartJsData {
  labels: string[]
  values: number[]
  colors: string[]
}

/**
 * Converte StatsEntry[] em datasets Chart.js.
 * 8+ categorias: top 7 + "Outros".
 * Cor estável por label (entidade), não por posição no ranking.
 */
export function statsToChartData(
  entries: StatsEntry[],
  options?: { statusSemantics?: boolean },
): ChartJsData {
  if (!entries.length) {
    return { labels: [], values: [], colors: [] }
  }

  const sorted = [...entries].sort((a, b) => b.value - a.value)
  let working = sorted

  if (sorted.length > DS_MAX_CATEGORIES) {
    const head = sorted.slice(0, DS_MAX_CATEGORIES - 1)
    const rest = sorted.slice(DS_MAX_CATEGORIES - 1)
    const othersValue = rest.reduce((sum, e) => sum + e.value, 0)
    working = [...head, { label: 'Outros', value: othersValue }]
  }

  const labels = working.map((e) => e.label)
  const values = working.map((e) => e.value)
  const colors = working.map((e) => {
    if (options?.statusSemantics) {
      return statusColor(e.label) ?? colorForEntity(e.label, DS_CATEGORICAL)
    }
    return colorForEntity(e.label, DS_CATEGORICAL)
  })

  return { labels, values, colors }
}

function statusColor(label: string): string | undefined {
  const key = label.toUpperCase()
  if (key.includes('SUBMIT') || key.includes('RESOLV') || key.includes('DONE') || key.includes('CONCLU')) {
    return DS_STATUS_COLORS.success
  }
  if (key.includes('CANCEL') || key.includes('ERROR') || key.includes('OPEN') || key.includes('CRIT')) {
    return DS_STATUS_COLORS.error
  }
  if (key.includes('WARN') || key.includes('PEND') || key.includes('DRAFT') || key.includes('HIGH')) {
    return DS_STATUS_COLORS.warning
  }
  if (key.includes('INFO') || key.includes('PROG')) {
    return DS_STATUS_COLORS.info
  }
  return undefined
}

export function isEmptyStats(entries: StatsEntry[] | undefined | null): boolean {
  if (!entries?.length) return true
  return entries.every((e) => !e.value)
}
