import type { Meta, StoryObj } from "@storybook/react";

import { ChecklistNonConformityCard } from "./ChecklistNonConformityCard";

const meta = {
  title: "Checklist/Molecules/ChecklistNonConformityCard",
  component: ChecklistNonConformityCard,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ChecklistNonConformityCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const base = {
  room: "Sala 204",
  category: "Limpeza e organização",
  checklistType: "Checklist de entrada",
  submittedDate: "23/06/2026",
  submittedTime: "14:38",
  filledBy: "Letícia Emanuele Güths",
  group: "MIDS-78",
  nonConformity:
    "3 computadores apresentam problemas para se conectar com a internet. Acho que os cabos de rede estão com algum mau contato.",
};

export const Fechado: Story = {
  args: { ...base },
};

export const Aberto: Story = {
  args: { ...base, defaultOpen: true },
};

export const Mobile: Story = {
  args: { ...base, defaultOpen: true },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

export const AbertaAguardandoAtendimento: Story = {
  args: { ...base, defaultOpen: true, status: "OPEN" },
};

export const EmAtendimento: Story = {
  args: { ...base, defaultOpen: true, status: "IN_PROGRESS" },
};

/** Resolvida, vista pelo coordenador SENAI — só ele valida ou reabre. */
export const ResolvidaParaValidarSenai: Story = {
  args: { ...base, defaultOpen: true, status: "RESOLVED", canValidate: true },
};

/** Resolvida, vista por professor/supervisor WEG — sem ação (só SENAI valida). */
export const ResolvidaSemPermissaoDeValidar: Story = {
  args: { ...base, defaultOpen: true, status: "RESOLVED", canValidate: false },
};

export const Reaberta: Story = {
  args: { ...base, defaultOpen: true, status: "REOPENED" },
};
