import type { Meta, StoryObj } from "@storybook/react";
import { ChecklistSubmissionCard } from "./ChecklistSubmissionCard";

const meta = {
  title: "Checklist/Molecules/ChecklistSubmissionCard",
  component: ChecklistSubmissionCard,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ChecklistSubmissionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const base = {
  room: "Sala 204",
  checklistType: "Checklist de entrada",
  submittedAt: "23/06/2026 às 14:38",
  filledBy: "Letícia Emanuele Güths",
  group: "MIDS-78",
  onView: () => {},
};

export const Conforme: Story = {
  args: { ...base },
};

export const ComNaoConformidade: Story = {
  args: { ...base, hasNonConformity: true },
};

export const Mobile: Story = {
  args: { ...base, hasNonConformity: true },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
