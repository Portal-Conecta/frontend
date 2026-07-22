"use client";

import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import { ChartCard } from "@portal/ui";

import {
  DS_CATEGORICAL,
  dsLineDatasetDefaults,
  makeDsChartOptions,
  registerLineCharts,
  useDsChartTheme,
} from "../../charts";
import type { StatsEntry } from "../../../types/dashboard";
import { isEmptyStats } from "./statsToChartData";

registerLineCharts();

/** Meta de conformidade exibida como linha de referência — configuração de produto, não dado do backend. */
const TENDENCIA_META = 90;

export interface DsTrendLineChartProps {
  data: StatsEntry[];
  loading?: boolean;
  height?: number;
}

export function DsTrendLineChart({
  data,
  loading = false,
  height = 300,
}: DsTrendLineChartProps) {
  const theme = useDsChartTheme();
  const brand = DS_CATEGORICAL[0] ?? theme.textBrand;
  const empty = !loading && isEmptyStats(data);

  const chartData = useMemo(
    () => ({
      labels: data.map((e) => e.label),
      datasets: [
        {
          label: "Conformidade",
          data: data.map((e) => e.value),
          borderColor: brand,
          backgroundColor: brand,
          ...dsLineDatasetDefaults(theme),
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: `Meta ${TENDENCIA_META}%`,
          data: data.map(() => TENDENCIA_META),
          borderColor: theme.textMuted,
          backgroundColor: theme.textMuted,
          borderDash: [6, 4],
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: false,
          tension: 0,
        },
      ],
    }),
    [data, theme, brand],
  );

  const options = useMemo(
    () =>
      makeDsChartOptions<"line">(theme, "line", {
        seriesCount: 2,
        ariaLabel: "Tendência de conformidade",
        overrides: {
          scales: {
            y: {
              min: 0,
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
      title="Tendência de Conformidade"
      height={height}
      loading={loading}
      empty={empty}
      action={
        <span className="rounded-full bg-background-default px-2 py-1 text-label-xs text-text-secondary">
          Meta {TENDENCIA_META}%
        </span>
      }
    >
      <Line data={chartData} options={options} />
    </ChartCard>
  );
}
