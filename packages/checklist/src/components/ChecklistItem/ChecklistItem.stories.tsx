import type { Meta, StoryObj } from "@storybook/react";
import { ChecklistItem } from "./ChecklistItem";

const meta = {
  title: "Checklist/Molecules/ChecklistItem",
  component: ChecklistItem,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ChecklistItem>;

export default meta;

type Story = StoryObj<typeof meta>;

const desc = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ";

export const Default: Story = {
  args: { title: "Ar Condicionado", description: desc },
};

export const Preenchido: Story = {
  args: { title: "Computadores", description: desc, defaultValue: "COMPLIANT" },
};

export const EmAnalise: Story = {
  args: {
    title: "Sala limpa e organizada",
    description: desc,
    defaultValue: "NON_COMPLIANT",
    disabled: true,
    issueStatus: "OPEN",
  },
};

export const EmManutencao: Story = {
  args: {
    title: "Sala limpa e organizada",
    description: desc,
    defaultValue: "NON_COMPLIANT",
    disabled: true,
    issueStatus: "IN_PROGRESS",
  },
};

export const Lista: Story = {
  args: { title: "" },
  render: () => (
    <div className="max-w-3xl">
      <ChecklistItem
        title="Computadores"
        description={desc}
        defaultValue="COMPLIANT"
      />
      <ChecklistItem
        title="Projetores"
        description={desc}
        defaultValue="NON_COMPLIANT"
      />
      <ChecklistItem title="Ar-condicionado" description={desc} />
    </div>
  ),
};
