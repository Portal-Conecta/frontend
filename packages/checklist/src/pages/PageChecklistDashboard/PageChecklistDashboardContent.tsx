'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Text } from '@portal/ui'

import {
  ChecklistDashboardCharts,
  DashboardKpiGrid,
  MOCK_DASHBOARD_STATS,
  deriveDashboardKpis,
} from '../../components/dashboard'
import { fetchDashboardStats } from '../../services/dashboard'
import type { DashboardStats } from '../../types/dashboard'

function defaultPeriod(): { from: string; to: string } {
  const to = new Date()
  const from = new Date()
  from.setDate(to.getDate() - 30)
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  return { from: iso(from), to: iso(to) }
}

export interface PageChecklistDashboardContentProps {
  /** Força modo demo (Storybook) com MOCK_DASHBOARD_STATS. */
  useMock?: boolean
}

export function PageChecklistDashboardContent({
  useMock = false,
}: PageChecklistDashboardContentProps) {
  const [loading, setLoading] = useState(!useMock)
  const [period, setPeriod] = useState(defaultPeriod)
  const [stats, setStats] = useState<DashboardStats | null>(
    useMock ? MOCK_DASHBOARD_STATS : null,
  )
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (useMock) {
      setStats(MOCK_DASHBOARD_STATS)
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await fetchDashboardStats({ from: period.from, to: period.to })
      setStats(data)
    } catch {
      setStats(null)
      setError(
        'Não foi possível carregar o dashboard. Verifique permissão (gestão SENAI/WEG) e se o backend está disponível.',
      )
    } finally {
      setLoading(false)
    }
  }, [period.from, period.to, useMock])

  useEffect(() => {
    void load()
  }, [load])

  const kpis = useMemo(
    () => (stats ? deriveDashboardKpis(stats) : undefined),
    [stats],
  )

  const periodLabel =
    stats?.periodo != null
      ? `${stats.periodo.from} → ${stats.periodo.to}`
      : `${period.from} → ${period.to}`

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
      <header className="flex flex-col gap-4 border-b border-border-default pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <Text as="p" variant="label-xs" tone="secondary" className="uppercase tracking-wide">
            Portal Conecta WEG
          </Text>
          <Text as="h1" variant="heading-h1" tone="primary">
            Dashboard dos Checklists
          </Text>
          <Text variant="body-md" tone="secondary">
            Visão gerencial de execuções e pendências no período selecionado.
          </Text>
          <Text variant="label-xs" tone="secondary">
            Período efetivo: {periodLabel}
            {useMock ? ' · demo' : ''}
          </Text>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <Text as="span" variant="label-xs" tone="secondary">
              De
            </Text>
            <input
              type="date"
              value={period.from}
              onChange={(e) => setPeriod((p) => ({ ...p, from: e.target.value }))}
              className="min-w-[140px] rounded-sm border border-border-default bg-background-surface px-3 py-2 text-body-sm text-text-primary focus:border-border-focus focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <Text as="span" variant="label-xs" tone="secondary">
              Até
            </Text>
            <input
              type="date"
              value={period.to}
              onChange={(e) => setPeriod((p) => ({ ...p, to: e.target.value }))}
              className="min-w-[140px] rounded-sm border border-border-default bg-background-surface px-3 py-2 text-body-sm text-text-primary focus:border-border-focus focus:outline-none"
            />
          </label>
          <Button
            variant="solid"
            tone="brand"
            size="md"
            onClick={() => void load()}
            iconLeft="funnel"
            disabled={loading}
          >
            Filtrar
          </Button>
        </div>
      </header>

      {error ? (
        <div
          role="alert"
          className="rounded-md border border-feedback-error/40 bg-background-surface px-4 py-3"
        >
          <Text variant="body-sm" tone="primary">
            {error}
          </Text>
          <div className="mt-3">
            <Button variant="outline" tone="neutral" size="sm" onClick={() => void load()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : null}

      <DashboardKpiGrid loading={loading} items={kpis} />

      <ChecklistDashboardCharts stats={stats} loading={loading} />
    </div>
  )
}
