import { Icon, Skeleton, Text } from "@portal/ui";

import type { DashboardKpiItem } from "./deriveDashboardKpis";

const toneIcon: Record<DashboardKpiItem["tone"], string> = {
  positive: "text-feedback-success",
  brand: "text-text-brand",
  negative: "text-feedback-error",
};

export interface DashboardKpiGridProps {
  loading?: boolean | undefined;
  /** KPIs calculados a partir do dashboard real. Obrigatório — chamador decide o array vazio, nunca cai em dado de demo. */
  items: readonly DashboardKpiItem[];
}

export function DashboardKpiGrid({
  loading = false,
  items,
}: DashboardKpiGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-md border border-border-default bg-background-surface p-4"
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
      {items.map((kpi) => (
        <article
          key={kpi.id}
          className="flex flex-col gap-3 rounded-md border border-border-default bg-background-surface p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <Text as="h2" variant="label-sm" tone="secondary">
              {kpi.label}
            </Text>
            <span
              className={[
                "flex h-10 w-10 items-center justify-center rounded-sm bg-background-default",
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
