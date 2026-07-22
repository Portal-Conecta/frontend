import type { Meta, StoryObj } from "@storybook/react";
import { ChecklistProgressBar } from "./ChecklistProgressBar";

const meta: Meta<typeof ChecklistProgressBar> = {
  title: "Checklist/Atoms/ChecklistProgressBar",
  component: ChecklistProgressBar,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Vazio: Story = {
  args: { answered: 0, total: 5 },
};

export const Parcial: Story = {
  args: { answered: 2, total: 5 },
};

export const Completo: Story = {
  args: { answered: 5, total: 5 },
};
