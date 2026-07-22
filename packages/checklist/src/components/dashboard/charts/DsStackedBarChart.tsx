"use client";

import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { ChartCard } from "@portal/ui";

import {
  dsBarDatasetDefaults,
  makeDsChartOptions,
  registerBarCharts,
  useDsChartTheme,
} from "../../charts";
import { DS_STATUS_COLORS_BLUE } from "../../charts";
import type { StatsEntry } from "../../../types/dashboard";
import { isEmptyStats } from "./statsToChartData";
import {
  parsePerformancePorTurno,
  type ComplianceBucket,
} from "./performancePorTurno";

registerBarCharts();

const BUCKET_SERIES: { key: ComplianceBucket; label: string; color: string }[] =
  [
    { key: "ok", label: "Conforme", color: DS_STATUS_COLORS_BLUE.success },
    { key: "atencao", label: "Atenção", color: DS_STATUS_COLORS_BLUE.warning },
    { key: "critico", label: "Crítico", color: DS_STATUS_COLORS_BLUE.info },
  ];

export interface DsStackedBarChartProps {
  data: StatsEntry[];
  loading?: boolean;
  height?: number;
}

export function DsStackedBarChart({
  data,
  loading = false,
  height = 300,
}: DsStackedBarChartProps) {
  const theme = useDsChartTheme();
  const parsed = useMemo(() => parsePerformancePorTurno(data), [data]);
  const empty = !loading && isEmptyStats(data);

  const chartData = useMemo(
    () => ({
      labels: parsed.labels,
      datasets: BUCKET_SERIES.map(({ key, label, color }) => ({
        label,
        data: parsed.series[key],
        backgroundColor: color,
        borderColor: color,
        stack: "turno",
        ...dsBarDatasetDefaults(),
      })),
    }),
    [parsed],
  );

  const options = useMemo(
    () =>
      makeDsChartOptions<"bar">(theme, "bar", {
        seriesCount: BUCKET_SERIES.length,
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
    <ChartCard
      title="Performance por Turno"
      height={height}
      loading={loading}
      empty={empty}
    >
      <Bar data={chartData} options={options} />
    </ChartCard>
  );
}
