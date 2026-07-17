import {
  DS_CATEGORICAL,
  DS_MAX_CATEGORIES,
  DS_STATUS_COLORS,
  colorForEntity,
} from '@portal/ui'

import type { StatsEntry } from '../../../types/dashboard'
import { humanizeStatsLabel } from './statsLabels'

export interface ChartJsData {
  labels: string[]
  values: number[]
  colors: string[]
}

/**
 * Converte StatsEntry[] em datasets Chart.js.
 * 8+ categorias: top 7 + "Outros" (exceto preserveOrder — séries temporais).
 * Cor estável por label (entidade), não por posição no ranking.
 */
export function statsToChartData(
  entries: StatsEntry[],
  options?: {
    statusSemantics?: boolean
    /** HIGH/MEDIUM/LOW com rampa de severidade. */
    prioritySemantics?: boolean
    preserveOrder?: boolean
  },
): ChartJsData {
  if (!entries.length) {
    return { labels: [], values: [], colors: [] }
  }

  let working: StatsEntry[]

  if (options?.preserveOrder) {
    working = [...entries]
  } else {
    const sorted = [...entries].sort((a, b) => b.value - a.value)
    if (sorted.length > DS_MAX_CATEGORIES) {
      const head = sorted.slice(0, DS_MAX_CATEGORIES - 1)
      const rest = sorted.slice(DS_MAX_CATEGORIES - 1)
      const othersValue = rest.reduce((sum, e) => sum + e.value, 0)
      working = [...head, { label: 'Outros', value: othersValue }]
    } else {
      working = sorted
    }
  }

  const labels = working.map((e) => humanizeStatsLabel(e.label))
  const values = working.map((e) => e.value)
  const colors = working.map((e) => {
    if (options?.prioritySemantics) {
      return priorityColor(e.label) ?? colorForEntity(e.label, DS_CATEGORICAL)
    }
    if (options?.statusSemantics) {
      return statusColor(e.label) ?? colorForEntity(e.label, DS_CATEGORICAL)
    }
    return colorForEntity(e.label, DS_CATEGORICAL)
  })

  return { labels, values, colors }
}

function statusColor(label: string): string | undefined {
  const key = label.toUpperCase()
  if (
    key.includes('SUBMIT') ||
    key.includes('RESOLV') ||
    key.includes('DONE') ||
    key.includes('CONCLU') ||
    key.includes('SUBMET')
  ) {
    return DS_STATUS_COLORS.success
  }
  if (
    key.includes('CANCEL') ||
    key.includes('ERROR') ||
    key.includes('OPEN') ||
    key.includes('ABERT') ||
    key.includes('CRIT')
  ) {
    return DS_STATUS_COLORS.error
  }
  if (
    key.includes('WARN') ||
    key.includes('PEND') ||
    key.includes('DRAFT') ||
    key.includes('RASCUN') ||
    key.includes('NÃO SUBMET') ||
    key.includes('NAO SUBMET') ||
    key.includes('HIGH') ||
    key.includes('ALTA')
  ) {
    return DS_STATUS_COLORS.warning
  }
  if (key.includes('INFO') || key.includes('PROG') || key.includes('ANDAM')) {
    return DS_STATUS_COLORS.info
  }
  return undefined
}

function priorityColor(label: string): string | undefined {
  const key = label.toUpperCase().replace(/[_\s-]/g, '')
  if (key.includes('HIGH') || key.includes('ALTA') || key.includes('CRIT')) {
    return DS_STATUS_COLORS.error
  }
  if (key.includes('MEDIUM') || key.includes('MEDIA') || key.includes('MÉDIA')) {
    return DS_STATUS_COLORS.warning
  }
  if (key.includes('LOW') || key.includes('BAIXA')) {
    return DS_STATUS_COLORS.info
  }
  return undefined
}

export function isEmptyStats(entries: StatsEntry[] | undefined | null): boolean {
  if (!entries?.length) return true
  return entries.every((e) => !e.value)
}

/** True quando o payload do dashboard não tem séries com valor > 0. */
export function isDashboardEmpty(stats: {
  execucoesPorDia?: StatsEntry[] | null
  execucoesPorStatus?: StatsEntry[] | null
  taxaConclusao?: StatsEntry[] | null
  issuesPorStatus?: StatsEntry[] | null
  issuesPorPrioridade?: StatsEntry[] | null
  issuesPorDia?: StatsEntry[] | null
} | null | undefined): boolean {
  if (!stats) return true
  return (
    isEmptyStats(stats.execucoesPorDia) &&
    isEmptyStats(stats.execucoesPorStatus) &&
    isEmptyStats(stats.issuesPorStatus) &&
    isEmptyStats(stats.issuesPorPrioridade) &&
    isEmptyStats(stats.issuesPorDia) &&
    // taxa só com zeros também conta como vazio
    (isEmptyStats(stats.taxaConclusao) ||
      stats.taxaConclusao?.every((e) => !e.value) === true)
  )
}
