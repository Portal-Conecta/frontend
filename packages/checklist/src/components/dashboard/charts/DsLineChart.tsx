"use client";

import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import { ChartCard } from "@portal/ui";

import {
  DS_CATEGORICAL_BLUE,
  dsLineDatasetDefaults,
  makeDsChartOptions,
  registerLineCharts,
  useDsChartTheme,
} from "../../charts";
import type { StatsEntry } from "../../../types/dashboard";
import { isEmptyStats, statsToChartData } from "./statsToChartData";

registerLineCharts();

export interface DsLineChartProps {
  title: string;
  data: StatsEntry[];
  loading?: boolean;
  height?: number;
  datasetLabel?: string;
}

export function DsLineChart({
  title,
  data,
  loading = false,
  height = 280,
  datasetLabel = "Total",
}: DsLineChartProps) {
  const theme = useDsChartTheme();
  // Séries temporais do backend (por dia) mantêm ordem cronológica.
  const chart = useMemo(
    () => statsToChartData(data, { preserveOrder: true }),
    [data],
  );
  const empty = !loading && isEmptyStats(data);

  const brandBlue = DS_CATEGORICAL_BLUE[0] ?? theme.textBrand;

  const chartData = useMemo(
    () => ({
      labels: chart.labels,
      datasets: [
        {
          label: datasetLabel,
          data: chart.values,
          borderColor: brandBlue,
          backgroundColor: brandBlue,
          ...dsLineDatasetDefaults(theme),
        },
      ],
    }),
    [chart, datasetLabel, theme, brandBlue],
  );

  const options = useMemo(
    () =>
      makeDsChartOptions<"line">(theme, "line", {
        seriesCount: 1,
        ariaLabel: title,
      }),
    [theme, title],
  );

  return (
    <ChartCard title={title} height={height} loading={loading} empty={empty}>
      <Line data={chartData} options={options} />
    </ChartCard>
  );
}
