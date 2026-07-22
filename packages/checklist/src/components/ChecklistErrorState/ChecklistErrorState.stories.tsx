import type { Meta, StoryObj } from "@storybook/react";
import { ChecklistErrorState } from "./ChecklistErrorState";

const meta = {
  title: "Checklist/Molecules/ChecklistErrorState",
  component: ChecklistErrorState,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ChecklistErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    description: "Não foi possível carregar as salas disponíveis.",
  },
};

export const ComRetry: Story = {
  args: {
    description: "Não foi possível carregar as salas disponíveis.",
    onRetry: () => {},
  },
};
