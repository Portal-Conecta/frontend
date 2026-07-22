import type { Meta, StoryObj } from "@storybook/react";
import { ChecklistActions } from "./ChecklistActions";

const meta = {
  title: "Checklist/Atoms/ChecklistActions",
  component: ChecklistActions,
  parameters: { layout: "centered" },
  args: {
    onSubmit: () => {},
    onEdit: () => {},
  },
} satisfies Meta<typeof ChecklistActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Submit: Story = {
  args: { mode: "submit" },
};

export const SubmitDisabled: Story = {
  args: { mode: "submit", isSubmitDisabled: true },
};

export const SubmitLoading: Story = {
  args: { mode: "submit", isSubmitting: true },
};

export const Edit: Story = {
  args: { mode: "edit" },
};
