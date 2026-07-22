import type { Meta, StoryObj } from "@storybook/react";

import { PageChecklistDashboardContent } from "../../pages/PageChecklistDashboard";
import { DsBarChart, DsStackedBarChart, DsTrendLineChart } from "./charts";
import { DASHBOARD_KPIS, FALHAS_POR_CATEGORIA } from "./data";
import { DashboardKpiGrid } from "./kpis";

/**
 * Stories do layout corporativo do dashboard.
 * Menu Storybook: Checklist → Dashboard → Layout
 */
const meta: Meta = {
  title: "Checklist/Dashboard/Layout",
  parameters: { layout: "padded" },
};

export default meta;

type Story = StoryObj;

export const Completo: Story = {
  name: "Tela completa (recomendado)",
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="min-h-screen bg-background-default p-6 md:p-8 lg:p-10">
      <PageChecklistDashboardContent useMock />
    </div>
  ),
};

export const Kpis: Story = {
  name: "Cards KPI",
  render: () => (
    <div className="max-w-[1200px] bg-background-default p-6">
      <DashboardKpiGrid items={DASHBOARD_KPIS} />
    </div>
  ),
};

export const TendenciaConformidade: Story = {
  name: "Tendência de conformidade",
  render: () => (
    <div className="max-w-[900px] bg-background-default p-6">
      <DsTrendLineChart
        height={320}
        data={[
          { label: "2026-05-04", value: 82 },
          { label: "2026-05-11", value: 84.5 },
          { label: "2026-05-18", value: 86 },
          { label: "2026-05-25", value: 88.2 },
          { label: "2026-06-01", value: 91 },
        ]}
      />
    </div>
  ),
};

export const FalhasPorCategoria: Story = {
  name: "Falhas por categoria",
  render: () => (
    <div className="max-w-[480px] bg-background-default p-6">
      <DsBarChart
        title="Falhas por categoria"
        data={FALHAS_POR_CATEGORIA}
        height={320}
      />
    </div>
  ),
};

export const PerformancePorTurno: Story = {
  name: "Performance por turno",
  render: () => (
    <div className="max-w-[640px] bg-background-default p-6">
      <DsStackedBarChart
        height={300}
        data={[
          { label: "FULL_AM_PM|ok", value: 22 },
          { label: "FULL_AM_PM|atencao", value: 6 },
          { label: "FULL_AM_PM|critico", value: 2 },
          { label: "FULL_PM_NT|ok", value: 15 },
          { label: "FULL_PM_NT|atencao", value: 5 },
          { label: "FULL_PM_NT|critico", value: 3 },
        ]}
      />
    </div>
  ),
};
