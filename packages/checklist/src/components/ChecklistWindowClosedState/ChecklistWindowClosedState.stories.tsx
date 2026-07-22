import type { Meta, StoryObj } from "@storybook/react";
import { ChecklistWindowClosedState } from "./ChecklistWindowClosedState";

const meta = {
  title: "Checklist/Molecules/ChecklistWindowClosedState",
  component: ChecklistWindowClosedState,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ChecklistWindowClosedState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
