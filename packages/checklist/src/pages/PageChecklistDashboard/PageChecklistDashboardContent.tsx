'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button, Text } from '@portal/ui'

import {
  AlertaOrientacao,
  DashboardKpiGrid,
  DsBarChart,
  DsStackedBarChart,
  DsTrendLineChart,
  FALHAS_POR_CATEGORIA,
  ZonaVermelhaTable,
} from '../../components/dashboard'
import { fetchDashboardStats } from '../../services/dashboard'

function defaultPeriod(): { from: string; to: string } {
  const to = new Date()
  const from = new Date()
  from.setDate(to.getDate() - 30)
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  return { from: iso(from), to: iso(to) }
}

export interface PageChecklistDashboardContentProps {
  /** Força modo demo (Storybook). */
  useMock?: boolean
}

export function PageChecklistDashboardContent({ useMock = false }: PageChecklistDashboardContentProps) {
  const [loading, setLoading] = useState(!useMock)
  const [period, setPeriod] = useState(defaultPeriod)
  const [demoNote, setDemoNote] = useState(useMock)

  const load = useCallback(async () => {
    if (useMock) {
      setLoading(false)
      setDemoNote(true)
      return
    }

    setLoading(true)
    try {
      await fetchDashboardStats({ from: period.from, to: period.to })
      setDemoNote(false)
    } catch {
      setDemoNote(true)
    } finally {
      setLoading(false)
    }
  }, [period.from, period.to, useMock])

  useEffect(() => {
    void load()
  }, [load])

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
            Visão gerencial de conformidade, cumprimento e não conformidades das turmas.
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
          <Button variant="solid" tone="brand" size="md" onClick={() => void load()} iconLeft="funnel">
            Filtrar
          </Button>
        </div>
      </header>

      {demoNote && !loading ? (
        <Text variant="label-xs" tone="secondary">
          Exibindo indicadores de referência do produto (demo). Conecte o backend para sincronizar o período.
        </Text>
      ) : null}

      <DashboardKpiGrid loading={loading} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <DsTrendLineChart loading={loading} height={320} />
        </div>
        <div className="xl:col-span-1">
          <DsBarChart
            title="Falhas por categoria"
            data={FALHAS_POR_CATEGORIA}
            loading={loading}
            height={320}
            datasetLabel="Falhas"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DsStackedBarChart loading={loading} height={300} />
        <AlertaOrientacao />
      </div>

      <ZonaVermelhaTable
        onCorrigir={(id) => {
          console.info('Corrigir issue', id)
        }}
      />
    </div>
  )
}
