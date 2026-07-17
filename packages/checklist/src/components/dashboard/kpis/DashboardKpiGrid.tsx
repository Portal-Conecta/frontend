"use client";

import { Icon, Skeleton, Text, type IconName } from "@portal/ui";

import { DASHBOARD_KPIS } from "../data/dashboardDemoData";
import type { DashboardKpiItem } from "./deriveDashboardKpis";

const toneIcon: Record<DashboardKpiItem["tone"], string> = {
  positive: "text-feedback-success",
  brand: "text-text-brand",
  negative: "text-feedback-error",
};

export interface DashboardKpiGridProps {
  loading?: boolean | undefined;
  /** KPIs calculados a partir do dashboard real; se omitido, usa demo. */
  items?: readonly DashboardKpiItem[] | undefined;
}

export function DashboardKpiGrid({
  loading = false,
  items,
}: DashboardKpiGridProps) {
  const kpis: readonly DashboardKpiItem[] =
    items ??
    DASHBOARD_KPIS.map((k) => ({
      id: k.id,
      label: k.label,
      value: k.value,
      hint: k.hint,
      icon: k.icon as IconName,
      tone: k.tone,
    }));

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-md border border-border-default bg-background-surface p-5"
          >
            <Skeleton variant="text" count={2} />
            <Skeleton variant="rect" height={40} className="mt-4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <article
          key={kpi.id}
          className="flex flex-col gap-3 rounded-md border border-border-default bg-background-surface p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <Text as="h2" variant="label-sm" tone="secondary">
              {kpi.label}
            </Text>
            <span
              className={[
                "flex h-9 w-9 items-center justify-center rounded-sm bg-background-default",
                toneIcon[kpi.tone],
              ].join(" ")}
              aria-hidden
            >
              <Icon name={kpi.icon} size="sm" />
            </span>
          </div>
          <Text
            as="p"
            variant="heading-h1"
            tone="primary"
            className="tracking-tight"
          >
            {kpi.value}
          </Text>
          <Text variant="body-sm" tone="secondary">
            {kpi.hint}
          </Text>
        </article>
      ))}
    </div>
  );
}
