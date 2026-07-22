import type { Meta, StoryObj } from "@storybook/react";

import { SectionTabs } from "./SectionTabs";

import { CHECKLIST_SECTION_TABS } from "../checklistSectionTabs";

const meta: Meta<typeof SectionTabs> = {
  title: "Checklist/SectionTabs",
  component: SectionTabs,
  parameters: {
    layout: "padded",
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/checklist/dashboard" },
    },
  },
  args: {
    tabs: [...CHECKLIST_SECTION_TABS],
  },
};

export default meta;
type Story = StoryObj<typeof SectionTabs>;

export const Default: Story = {};

/**
 * `isActive` cobre subrotas (`pathname.startsWith(href + '/')`) — aqui a rota
 * mockada é `/checklist/monitor-envios/123`, então a aba "Monitor de envios" fica ativa.
 */
export const SubrotaAtiva: Story = {
  parameters: {
    nextjs: {
      navigation: { pathname: "/checklist/monitor-envios/123" },
    },
  },
};

export const UltimaAbaAtiva: Story = {
  parameters: {
    nextjs: {
      navigation: { pathname: "/checklist/gestao" },
    },
  },
};

export const DashboardAtivo: Story = {
  parameters: {
    nextjs: {
      navigation: { pathname: "/checklist/dashboard" },
    },
  },
};
