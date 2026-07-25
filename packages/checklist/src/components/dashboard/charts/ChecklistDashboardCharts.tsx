"use client";

/**
 * Grade de gráficos do dashboard — todos consomem ChartCard + makeDsChartOptions (via Ds*Chart).
 *
 * "Taxa de conclusão" e "Pendências por dia" ficam de fora de propósito: a
 * primeira já aparece como card de KPI (redundante como gráfico), e a
 * segunda está com o dado do backend quebrado (agrupa por `due_at`, um prazo
 * futuro, em vez da data de abertura da pendência — nunca cai numa janela
 * passada). "Pendências por prioridade" também fica de fora: prioridade de
 * issue é sempre MEDIUM hardcoded no backend (sem feature pra variar),
 * então o gráfico nunca mostraria nada além de uma barra só.
 * "Pendências por status" também saiu: redundante com o card de KPI
 * "Pendências" (total + abertas/em andamento). Ver ADR/discussão do
 * dashboard antes de trazer alguma de volta.
 */
import type { DashboardStats } from "../../../types/dashboard";
import { DsDoughnutChart } from "./DsDoughnutChart";
import { DsLineChart } from "./DsLineChart";
import { DsStackedBarChart } from "./DsStackedBarChart";
import { DsTrendLineChart } from "./DsTrendLineChart";

export interface ChecklistDashboardChartsProps {
  stats?: DashboardStats | null;
  loading?: boolean;
}

export function ChecklistDashboardCharts({
  stats,
  loading = false,
}: ChecklistDashboardChartsProps) {
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
      <DsStackedBarChart
        data={stats?.performancePorTurno ?? []}
        loading={loading}
      />
      <DsTrendLineChart
        data={stats?.tendenciaConformidade ?? []}
        loading={loading}
      />
    </div>
  );
}
