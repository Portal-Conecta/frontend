import type { Meta, StoryObj } from "@storybook/react";

import { ChecklistDashboardCharts } from "./ChecklistDashboardCharts";
import { MOCK_DASHBOARD_STATS } from "../data/mockDashboardStats";

const meta: Meta<typeof ChecklistDashboardCharts> = {
  title: "Checklist/Dashboard/Charts",
  component: ChecklistDashboardCharts,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ChecklistDashboardCharts>;

export const ComDados: Story = {
  args: {
    stats: MOCK_DASHBOARD_STATS,
    loading: false,
  },
};

export const Loading: Story = {
  args: {
    stats: null,
    loading: true,
  },
};

export const Vazio: Story = {
  args: {
    stats: {
      periodo: { from: "2026-06-01", to: "2026-06-30" },
      execucoesPorDia: [],
      execucoesPorStatus: [],
      taxaConclusao: [],
      issuesPorStatus: [],
      issuesPorPrioridade: [],
      issuesPorDia: [],
      performancePorTurno: [],
      tendenciaConformidade: [],
    },
    loading: false,
  },
};
