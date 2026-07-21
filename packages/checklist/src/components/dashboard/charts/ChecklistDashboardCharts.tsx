"use client";

/**
 * Grade de gráficos do dashboard — todos consomem ChartCard + makeDsChartOptions (via Ds*Chart).
 */
import { useMemo } from "react";

import type { DashboardStats } from "../../../types/dashboard";
import { DsBarChart } from "./DsBarChart";
import { DsDoughnutChart } from "./DsDoughnutChart";
import { DsLineChart } from "./DsLineChart";
import { taxaConclusaoToChartEntries } from "./taxaConclusao";

export interface ChecklistDashboardChartsProps {
  stats?: DashboardStats | null;
  loading?: boolean;
}

export function ChecklistDashboardCharts({
  stats,
  loading = false,
}: ChecklistDashboardChartsProps) {
  const taxaChart = useMemo(
    () => taxaConclusaoToChartEntries(stats?.taxaConclusao),
    [stats?.taxaConclusao],
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <DsLineChart
        title="Execuções por dia"
        data={stats?.execucoesPorDia ?? []}
        loading={loading}
        datasetLabel="Execuções"
      />
      <DsDoughnutChart
        title="Execuções por status"
        data={stats?.execucoesPorStatus ?? []}
        loading={loading}
        statusSemantics
      />
      <DsDoughnutChart
        title="Taxa de conclusão"
        data={taxaChart}
        loading={loading}
        kpi
        statusSemantics
      />
      <DsBarChart
        title="Pendências por status"
        data={stats?.issuesPorStatus ?? []}
        loading={loading}
        statusSemantics
        horizontal
      />
      <DsBarChart
        title="Pendências por prioridade"
        data={stats?.issuesPorPrioridade ?? []}
        loading={loading}
        prioritySemantics
      />
      <DsLineChart
        title="Pendências por dia"
        data={stats?.issuesPorDia ?? []}
        loading={loading}
        datasetLabel="Pendências"
      />
    </div>
  );
}
