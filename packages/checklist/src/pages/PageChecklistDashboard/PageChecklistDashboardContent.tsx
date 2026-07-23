"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, DateInput, EmptyState, Field, Icon, Text } from "@portal/ui";

import {
  ChecklistDashboardCharts,
  DashboardKpiGrid,
  MOCK_DASHBOARD_STATS,
  defaultDashboardPeriod,
  deriveDashboardKpis,
  formatIsoDatePt,
  isDashboardEmpty,
  validateDashboardPeriod,
} from "../../components/dashboard";
import type { SectionTab } from "../../components/SectionTabs";
import { SectionTabs } from "../../components/SectionTabs";
import { fetchDashboardStats } from "../../services/dashboard/dashboardClient";
import type { DashboardStats } from "../../types/dashboard";

export interface PageChecklistDashboardContentProps {
  /** Força modo demo (Storybook) com MOCK_DASHBOARD_STATS. */
  useMock?: boolean;
  /** Abas do módulo já resolvidas por papel (`resolveChecklistSectionTabs`). */
  sectionTabs?: readonly SectionTab[];
}

export function PageChecklistDashboardContent({
  useMock = false,
  sectionTabs = [],
}: PageChecklistDashboardContentProps) {
  const [loading, setLoading] = useState(!useMock);
  const [period, setPeriod] = useState(defaultDashboardPeriod);
  const [stats, setStats] = useState<DashboardStats | null>(
    useMock ? MOCK_DASHBOARD_STATS : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [periodError, setPeriodError] = useState<string | null>(null);

  const load = useCallback(
    async (from: string, to: string) => {
      if (useMock) {
        setStats(MOCK_DASHBOARD_STATS);
        setError(null);
        setPeriodError(null);
        setLoading(false);
        return;
      }

      const validation = validateDashboardPeriod(from, to);
      if (!validation.ok) {
        setPeriodError(validation.message);
        return;
      }
      setPeriodError(null);

      setLoading(true);
      setError(null);
      try {
        const data = await fetchDashboardStats({ from, to });
        setStats(data);
        if (data.periodo?.from && data.periodo?.to) {
          setPeriod({ from: data.periodo.from, to: data.periodo.to });
        }
      } catch {
        setStats(null);
        setError(
          "Não foi possível carregar o dashboard. Verifique permissão (gestão SENAI/WEG) e se o backend está disponível.",
        );
      } finally {
        setLoading(false);
      }
    },
    [useMock],
  );

  useEffect(() => {
    void load(period.from, period.to);
  }, [load]);

  const kpis = useMemo(
    () => (stats ? deriveDashboardKpis(stats) : undefined),
    [stats],
  );

  const emptyData = !loading && !error && isDashboardEmpty(stats);

  const periodLabel =
    stats?.periodo != null
      ? `${formatIsoDatePt(stats.periodo.from)} → ${formatIsoDatePt(stats.periodo.to)}`
      : `${formatIsoDatePt(period.from)} → ${formatIsoDatePt(period.to)}`;

  return (
    <div className="flex w-full flex-col gap-6 p-6 md:p-8">
      {/* 1. Abas do módulo */}
      {sectionTabs.length > 0 ? <SectionTabs tabs={[...sectionTabs]} /> : null}

      {/* 2. Conteúdo do Dashboard em largura total (alinhado com as abas) */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <Text as="h1" variant="heading-h1" tone="primary">
            Dashboard dos Checklists
          </Text>
          <Text variant="body-md" tone="secondary">
            Visão gerencial de execuções e pendências no período selecionado.
          </Text>
          <Text variant="label-xs" tone="secondary">
            Período efetivo: {periodLabel}
            {useMock ? " · demo" : ""}
          </Text>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-wrap items-end gap-3">
            <Field label="De">
              <DateInput
                value={period.from}
                max={period.to || toLocalMax()}
                onChange={(from) => setPeriod((p) => ({ ...p, from }))}
                disabled={loading}
              />
            </Field>
            <Field label="Até">
              <DateInput
                value={period.to}
                {...(period.from ? { min: period.from } : {})}
                max={toLocalMax()}
                onChange={(to) => setPeriod((p) => ({ ...p, to }))}
                disabled={loading}
              />
            </Field>
            <Button
              variant="solid"
              tone="brand"
              size="md"
              onClick={() => void load(period.from, period.to)}
              iconLeft="funnel"
              disabled={loading}
              className="h-11"
            >
              Filtrar
            </Button>
          </div>
          {periodError ? (
            <Text
              variant="label-xs"
              tone="primary"
              className="text-feedback-error"
            >
              {periodError}
            </Text>
          ) : null}
        </div>
      </header>

      {error ? (
        <EmptyState
          title="Não foi possível carregar o dashboard"
          description={error}
          illustration={
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-interactive-subtle text-interactive-default">
              <Icon name="triangle-alert" size="lg" decorative />
            </span>
          }
          action={
            <Button
              variant="outlined"
              tone="brand"
              size="sm"
              onClick={() => void load(period.from, period.to)}
            >
              Tentar novamente
            </Button>
          }
        />
      ) : emptyData ? (
        <EmptyState
          title="Nenhum dado no período selecionado"
          description={`Não há execuções ou pendências registradas entre ${periodLabel}. Os indicadores e gráficos aparecem assim que houver atividade no período.`}
          illustration={
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-interactive-subtle text-interactive-default">
              <Icon name="clipboard-list" size="lg" decorative />
            </span>
          }
        />
      ) : (
        <>
          <DashboardKpiGrid loading={loading} items={kpis ?? []} />
          <ChecklistDashboardCharts stats={stats} loading={loading} />
        </>
      )}
    </div>
  );
}

function toLocalMax(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}