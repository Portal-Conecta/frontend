import type { ChartOptions, ChartType } from "chart.js";

import { colorPrimitives, colors, typography } from "@portal/ui";

export type DsChartKind = "bar" | "line" | "doughnut" | "kpi";

export interface DsChartTheme {
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textBrand: string;
  surface: string;
  background: string;
  border: string;
  fontFamily: string;
  fontSize: number;
}

const SSR_FALLBACK: DsChartTheme = {
  textPrimary: colors.text.primary,
  textSecondary: colors.text.secondary,
  textMuted: colors.text.disabled,
  textBrand: colors.text.brand,
  surface: colors.background.surface,
  background: colors.background.default,
  border: colors.border.default,
  fontFamily: typography.fontFamily.inter.join(", "),
  fontSize: 12,
};

/**
 * Lê cores/tipografia do DS em runtime via classes utilitárias reais
 * (ex.: text-text-primary). Fallback para tokens em SSR / falha de probe.
 */
export function readDsChartTheme(): DsChartTheme {
  if (typeof document === "undefined") {
    return { ...SSR_FALLBACK };
  }

  return {
    textPrimary: probeClassColor(
      "text-text-primary",
      "color",
      SSR_FALLBACK.textPrimary,
    ),
    textSecondary: probeClassColor(
      "text-text-secondary",
      "color",
      SSR_FALLBACK.textSecondary,
    ),
    textMuted: probeClassColor(
      "text-text-disabled",
      "color",
      SSR_FALLBACK.textMuted,
    ),
    textBrand: probeClassColor(
      "text-text-brand",
      "color",
      SSR_FALLBACK.textBrand,
    ),
    surface: probeClassColor(
      "bg-background-surface",
      "backgroundColor",
      SSR_FALLBACK.surface,
    ),
    background: probeClassColor(
      "bg-background-default",
      "backgroundColor",
      SSR_FALLBACK.background,
    ),
    border: probeClassColor(
      "border-border-default",
      "borderColor",
      SSR_FALLBACK.border,
    ),
    fontFamily: SSR_FALLBACK.fontFamily,
    fontSize: SSR_FALLBACK.fontSize,
  };
}

function probeClassColor(
  className: string,
  property: "color" | "backgroundColor" | "borderColor",
  fallback: string,
): string {
  try {
    const el = document.createElement("span");
    el.className = className;
    if (property === "borderColor") {
      el.style.border = "1px solid transparent";
    }
    el.style.position = "absolute";
    el.style.visibility = "hidden";
    el.style.pointerEvents = "none";
    document.body.appendChild(el);
    const value = getComputedStyle(el)[property];
    document.body.removeChild(el);
    if (!value || value === "rgba(0, 0, 0, 0)" || value === "transparent") {
      return fallback;
    }
    return value;
  } catch {
    return fallback;
  }
}

/** Overrides tipados de forma frouxa — Chart.js + exactOptionalPropertyTypes. */
export type DsChartOverrides = Record<string, unknown>;

export interface MakeDsChartOptionsConfig {
  /** Quantidade de séries (legenda se ≥ 2). */
  seriesCount?: number;
  /** Índice / modo sem eixo dual — nunca dual-axis. */
  indexAxis?: "x" | "y";
  /** Título acessível do gráfico. */
  ariaLabel?: string;
  /** Sobrescritas pontuais (sem dual yAxes). */
  overrides?: DsChartOverrides;
}

/**
 * Options Chart.js alinhadas ao Design System.
 * Retorno genérico por tipo de chart (`'line' | 'bar' | 'doughnut'`).
 */
export function makeDsChartOptions<TType extends ChartType = ChartType>(
  theme: DsChartTheme,
  kind: DsChartKind,
  config: MakeDsChartOptionsConfig = {},
): ChartOptions<TType> {
  const seriesCount = config.seriesCount ?? 1;
  const showLegend = seriesCount >= 2;
  const isDoughnut = kind === "doughnut" || kind === "kpi";
  const isHorizontalBar = kind === "bar" && config.indexAxis === "y";

  const cartesianScales = {
    x: {
      grid: {
        color: withAlpha(theme.border, 0.45),
        drawTicks: false,
        lineWidth: 1,
      },
      border: { display: false },
      ticks: {
        color: theme.textMuted,
        font: { family: theme.fontFamily, size: 11 },
        maxRotation: 0,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: withAlpha(theme.border, 0.35),
        drawTicks: false,
        lineWidth: 1,
      },
      border: { display: false },
      ticks: {
        color: theme.textMuted,
        font: { family: theme.fontFamily, size: 11 },
        padding: 6,
      },
    },
  };

  const base: Record<string, unknown> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "nearest",
      intersect: false,
    },
    plugins: {
      legend: {
        display: kind === "kpi" ? false : showLegend,
        position: isDoughnut ? "bottom" : "top",
        labels: {
          color: theme.textSecondary,
          font: {
            family: theme.fontFamily,
            size: theme.fontSize,
          },
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          padding: 16,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: theme.surface,
        titleColor: theme.textPrimary,
        bodyColor: theme.textSecondary,
        borderColor: theme.border,
        borderWidth: 1,
        titleFont: { family: theme.fontFamily, size: 12, weight: "600" },
        bodyFont: { family: theme.fontFamily, size: 12 },
        padding: 10,
        displayColors: true,
        callbacks: {
          label: (item: {
            dataset?: { label?: string };
            formattedValue?: string;
            raw?: unknown;
          }) => {
            const datasetLabel = item.dataset?.label
              ? `${item.dataset.label}: `
              : "";
            return `${datasetLabel}${item.formattedValue ?? String(item.raw ?? "")}`;
          },
        },
      },
      title: {
        display: false,
      },
    },
    elements: {
      line: {
        borderWidth: 2,
        tension: 0.25,
      },
      point: {
        radius: 4,
        hoverRadius: 5,
        borderWidth: 2,
      },
      bar: {
        borderRadius: 4,
        borderSkipped: false,
      },
      arc: {
        borderWidth: 2,
        borderColor: theme.surface,
      },
    },
  };

  if (isHorizontalBar) {
    base.indexAxis = "y";
  }

  if (!isDoughnut) {
    base.scales = cartesianScales;
  }

  if (config.overrides) {
    deepMerge(base, config.overrides);
  }

  return base as unknown as ChartOptions<TType>;
}

/** Defaults de dataset alinhados às regras de marca. */
export function dsLineDatasetDefaults(_theme?: DsChartTheme) {
  return {
    borderWidth: 2,
    pointRadius: 4,
    pointHoverRadius: 5,
    pointHitRadius: 8,
    tension: 0.25,
    fill: false as const,
  };
}

export function dsBarDatasetDefaults() {
  return {
    borderRadius: 4,
    borderSkipped: false as const,
    maxBarThickness: 40,
  };
}

export function dsDoughnutDatasetDefaults(theme: DsChartTheme) {
  return {
    borderWidth: 2,
    borderColor: theme.surface,
    hoverOffset: 4,
  };
}

function withAlpha(cssColor: string, alpha: number): string {
  if (cssColor.startsWith("#")) {
    const hex = cssColor.slice(1);
    const full =
      hex.length === 3
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    if ([r, g, b].some((n) => Number.isNaN(n))) {
      return cssColor;
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const m = cssColor.match(/rgba?\(([^)]+)\)/);
  if (m?.[1]) {
    const parts = m[1].split(",").map((p) => p.trim());
    const r = parts[0] ?? "0";
    const g = parts[1] ?? "0";
    const b = parts[2] ?? "0";
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return cssColor;
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): void {
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = target[key];
    if (
      srcVal !== null &&
      typeof srcVal === "object" &&
      !Array.isArray(srcVal) &&
      tgtVal !== null &&
      typeof tgtVal === "object" &&
      !Array.isArray(tgtVal)
    ) {
      deepMerge(
        tgtVal as Record<string, unknown>,
        srcVal as Record<string, unknown>,
      );
    } else {
      target[key] = srcVal;
    }
  }
}

/** Fallback estático de marca (SSR / testes). */
export const DS_CHART_BRAND = colorPrimitives.blue[500];
