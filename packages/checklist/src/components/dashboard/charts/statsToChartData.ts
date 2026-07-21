import { DS_CATEGORICAL_BLUE } from '@portal/ui'

import type { StatsEntry } from '../../../types/dashboard'
import { humanizeStatsLabel } from './statsLabels'

export interface ChartJsData {
  labels: string[]
  values: number[]
  colors: string[]
}

/**
 * Paleta mínima do dashboard — só 3 azuis do DS (brand → accent → subtle).
 * Evita “arco-íris” por hash ou status.
 */
const SIMPLE_BLUE = [
  DS_CATEGORICAL_BLUE[0], // brand
  DS_CATEGORICAL_BLUE[1], // accent
  DS_CATEGORICAL_BLUE[2], // subtle
] as const

const MAX_CATEGORIES = SIMPLE_BLUE.length

/**
 * Converte StatsEntry[] em datasets Chart.js.
 * Cores simples: linha = brand; categorias = até 3 tons de azul em ordem de ranking.
 */
export function statsToChartData(
  entries: StatsEntry[],
  options?: {
    statusSemantics?: boolean
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
    if (sorted.length > MAX_CATEGORIES) {
      const head = sorted.slice(0, MAX_CATEGORIES - 1)
      const rest = sorted.slice(MAX_CATEGORIES - 1)
      const othersValue = rest.reduce((sum, e) => sum + e.value, 0)
      working = [...head, { label: 'Outros', value: othersValue }]
    } else {
      working = sorted
    }
  }

  const labels = working.map((e) => humanizeStatsLabel(e.label))
  const values = working.map((e) => e.value)
  const brand = SIMPLE_BLUE[0]!

  // Série temporal: uma cor só
  if (options?.preserveOrder) {
    return {
      labels,
      values,
      colors: working.map(() => brand),
    }
  }

  // Barras / donuts: no máx. 3 azuis, na ordem do ranking (maior → brand)
  const colors = working.map((_, index) => {
    const color = SIMPLE_BLUE[Math.min(index, SIMPLE_BLUE.length - 1)]
    return color ?? brand
  })

  return { labels, values, colors }
}

export function isEmptyStats(entries: StatsEntry[] | undefined | null): boolean {
  if (!entries?.length) return true
  return entries.every((e) => !e.value)
}

/** True quando o payload do dashboard não tem séries com valor > 0. */
export function isDashboardEmpty(
  stats:
    | {
        execucoesPorDia?: StatsEntry[] | null
        execucoesPorStatus?: StatsEntry[] | null
        taxaConclusao?: StatsEntry[] | null
        issuesPorStatus?: StatsEntry[] | null
        issuesPorPrioridade?: StatsEntry[] | null
        issuesPorDia?: StatsEntry[] | null
      }
    | null
    | undefined,
): boolean {
  if (!stats) return true
  return (
    isEmptyStats(stats.execucoesPorDia) &&
    isEmptyStats(stats.execucoesPorStatus) &&
    isEmptyStats(stats.issuesPorStatus) &&
    isEmptyStats(stats.issuesPorPrioridade) &&
    isEmptyStats(stats.issuesPorDia) &&
    (isEmptyStats(stats.taxaConclusao) ||
      stats.taxaConclusao?.every((e) => !e.value) === true)
  )
}
