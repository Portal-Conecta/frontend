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
  args: { title: "Computadores", description: desc, defaultValue: "conforme" },
};

export const Lista: Story = {
  args: { title: "" },
  render: () => (
    <div className="max-w-3xl">
      <ChecklistItem
        title="Computadores"
        description={desc}
        defaultValue="conforme"
      />
      <ChecklistItem
        title="Projetores"
        description={desc}
        defaultValue="nao-conforme"
      />
      <ChecklistItem title="Ar-condicionado" description={desc} />
    </div>
  ),
};
