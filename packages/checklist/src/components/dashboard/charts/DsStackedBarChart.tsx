"use client";

import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  ChartCard,
  dsBarDatasetDefaults,
  makeDsChartOptions,
  registerBarCharts,
  useDsChartTheme,
} from "@portal/ui";

import {
  PERFORMANCE_TURNO_LABELS,
  PERFORMANCE_TURNO_SERIES,
} from "../data/dashboardDemoData";

registerBarCharts();

export interface DsStackedBarChartProps {
  loading?: boolean;
  height?: number;
}

export function DsStackedBarChart({
  loading = false,
  height = 300,
}: DsStackedBarChartProps) {
  const theme = useDsChartTheme();

  const chartData = useMemo(
    () => ({
      labels: [...PERFORMANCE_TURNO_LABELS],
      datasets: PERFORMANCE_TURNO_SERIES.map((series) => ({
        label: series.label,
        data: [...series.data],
        backgroundColor: series.color,
        borderColor: series.color,
        stack: "turno",
        ...dsBarDatasetDefaults(),
      })),
    }),
    [],
  );

  const options = useMemo(
    () =>
      makeDsChartOptions<"bar">(theme, "bar", {
        seriesCount: PERFORMANCE_TURNO_SERIES.length,
        ariaLabel: "Performance por turno",
        overrides: {
          scales: {
            x: { stacked: true },
            y: {
              stacked: true,
              max: 100,
              ticks: {
                callback: (v: string | number) => `${v}%`,
              },
            },
          },
        },
      }),
    [theme],
  );

  return (
    <ChartCard title="Performance por Turno" height={height} loading={loading}>
      <Bar data={chartData} options={options} />
    </ChartCard>
  );
}
