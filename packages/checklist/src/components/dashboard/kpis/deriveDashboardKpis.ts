import type { IconName } from '@portal/ui'

import type { DashboardStats, StatsEntry } from '../../../types/dashboard'

export interface DashboardKpiItem {
  id: string
  label: string
  value: string
  hint: string
  icon: IconName
  tone: 'positive' | 'brand' | 'negative'
}

function sum(entries: StatsEntry[]): number {
  return entries.reduce((acc, e) => acc + e.value, 0)
}

function findValue(entries: StatsEntry[], predicates: string[]): number {
  const upper = predicates.map((p) => p.toUpperCase())
  const hit = entries.find((e) => {
    const label = e.label.toUpperCase()
    return upper.some((p) => label.includes(p))
  })
  return hit?.value ?? 0
}

function formatPct(part: number, total: number): string {
  if (total <= 0) return '0%'
  const pct = Math.round((part / total) * 1000) / 10
  return `${pct.toLocaleString('pt-BR')}%`
}

/**
 * KPIs derivados do payload composto GET /api/checklist-stats/dashboard.
 * O backend não envia cards de KPI prontos — só séries/agregações.
 */
export function deriveDashboardKpis(stats: DashboardStats): DashboardKpiItem[] {
  const taxaTotal = sum(stats.taxaConclusao)
  const concluidas = findValue(stats.taxaConclusao, [
    'CONCLU',
    'SUBMIT',
    'DONE',
    'COMPLETED',
  ])
  // fallback: maior fatia se labels forem genéricos
  const taxaPart =
    concluidas > 0
      ? concluidas
      : stats.taxaConclusao.length
        ? Math.max(...stats.taxaConclusao.map((e) => e.value))
        : 0

  const totalExec = sum(stats.execucoesPorStatus)
  const submitted = findValue(stats.execucoesPorStatus, ['SUBMIT'])
  const totalIssues = sum(stats.issuesPorStatus)
  const openIssues =
    findValue(stats.issuesPorStatus, ['OPEN']) +
    findValue(stats.issuesPorStatus, ['IN_PROGRESS', 'PROGRESS', 'ANDAM'])
  const highPriority = findValue(stats.issuesPorPrioridade, ['HIGH', 'ALTA', 'CRIT'])

  return [
    {
      id: 'taxa-conclusao',
      label: 'Taxa de conclusão',
      value: formatPct(taxaPart, taxaTotal || taxaPart),
      hint: 'Execuções concluídas no recorte',
      icon: 'circle-check',
      tone: 'positive',
    },
    {
      id: 'execucoes',
      label: 'Execuções',
      value: totalExec.toLocaleString('pt-BR'),
      hint:
        submitted > 0
          ? `${submitted.toLocaleString('pt-BR')} submetidas`
          : 'Total por status no período',
      icon: 'clipboard-list',
      tone: 'brand',
    },
    {
      id: 'pendencias',
      label: 'Pendências',
      value: totalIssues.toLocaleString('pt-BR'),
      hint:
        openIssues > 0
          ? `${openIssues.toLocaleString('pt-BR')} abertas / em andamento`
          : 'Issues no recorte',
      icon: 'clipboard-list',
      tone: 'brand',
    },
    {
      id: 'prioridade-alta',
      label: 'Prioridade alta',
      value: highPriority.toLocaleString('pt-BR'),
      hint: 'Issues HIGH no recorte',
      icon: 'triangle-alert',
      tone: 'negative',
    },
  ]
}
