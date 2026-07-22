"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, DateInput, Text } from "@portal/ui";

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
        // Alinha inputs ao período efetivo resolvido no backend
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

  // Carga inicial: `load` só muda com useMock; período só no botão Filtrar.
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
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
      {/* Abas do módulo — acima do título do dashboard */}
      {sectionTabs.length > 0 ? <SectionTabs tabs={[...sectionTabs]} /> : null}

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
            <div className="flex flex-col gap-1">
              <Text
                as="span"
                id="dashboard-period-from-label"
                variant="label-xs"
                tone="secondary"
              >
                De
              </Text>
              <DateInput
                value={period.from}
                max={period.to || toLocalMax()}
                onChange={(from) => setPeriod((p) => ({ ...p, from }))}
                aria-labelledby="dashboard-period-from-label"
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Text
                as="span"
                id="dashboard-period-to-label"
                variant="label-xs"
                tone="secondary"
              >
                Até
              </Text>
              <DateInput
                value={period.to}
                {...(period.from ? { min: period.from } : {})}
                max={toLocalMax()}
                onChange={(to) => setPeriod((p) => ({ ...p, to }))}
                aria-labelledby="dashboard-period-to-label"
                disabled={loading}
              />
            </div>
            <Button
              variant="solid"
              tone="brand"
              size="md"
              onClick={() => void load(period.from, period.to)}
              iconLeft="funnel"
              disabled={loading}
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
        <div
          role="alert"
          className="rounded-md border border-feedback-error/40 bg-background-surface px-4 py-3"
        >
          <Text variant="body-sm" tone="primary">
            {error}
          </Text>
          <div className="mt-3">
            <Button
              variant="outlined"
              tone="brand"
              size="sm"
              onClick={() => void load(period.from, period.to)}
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : null}

      {emptyData ? (
        <div
          role="status"
          className="rounded-md border border-border-default bg-background-surface px-4 py-3"
        >
          <Text variant="body-sm" tone="primary">
            Nenhum dado de checklist no período {periodLabel}.
          </Text>
          <Text variant="body-sm" tone="secondary" className="mt-1">
            Os indicadores e gráficos ficam zerados até existirem execuções ou
            pendências registradas.
          </Text>
        </div>
      ) : null}

      <DashboardKpiGrid loading={loading} items={kpis ?? []} />

      <ChecklistDashboardCharts stats={stats} loading={loading} />
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
