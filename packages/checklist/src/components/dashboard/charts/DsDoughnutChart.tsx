"use client";

import { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  ChartCard,
  dsDoughnutDatasetDefaults,
  makeDsChartOptions,
  registerDoughnutCharts,
  useDsChartTheme,
} from "@portal/ui";

import type { StatsEntry } from "../../../types/dashboard";
import { isEmptyStats, statsToChartData } from "./statsToChartData";

registerDoughnutCharts();

export interface DsDoughnutChartProps {
  title: string;
  data: StatsEntry[];
  loading?: boolean;
  height?: number;
  /** KPI mode: sem legenda ruidosa. */
  kpi?: boolean;
  statusSemantics?: boolean;
}

export function DsDoughnutChart({
  title,
  data,
  loading = false,
  height = 280,
  kpi = false,
  statusSemantics = false,
}: DsDoughnutChartProps) {
  const theme = useDsChartTheme();
  const chart = useMemo(
    () => statsToChartData(data, { statusSemantics }),
    [data, statusSemantics],
  );
  const empty = !loading && isEmptyStats(data);

  const chartData = useMemo(
    () => ({
      labels: chart.labels,
      datasets: [
        {
          label: title,
          data: chart.values,
          backgroundColor: chart.colors,
          ...dsDoughnutDatasetDefaults(theme),
        },
      ],
    }),
    [chart, theme, title],
  );

  const options = useMemo(
    () =>
      makeDsChartOptions<"doughnut">(theme, kpi ? "kpi" : "doughnut", {
        seriesCount: chart.labels.length,
        ariaLabel: title,
      }),
    [theme, title, kpi, chart.labels.length],
  );

  return (
    <ChartCard title={title} height={height} loading={loading} empty={empty}>
      <Doughnut data={chartData} options={options} />
    </ChartCard>
  );
}
