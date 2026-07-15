import { BaseFeedbackModal } from "./BaseFeedbackModal";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof BaseFeedbackModal> = {
  title: "Checklist/Molecules/BaseFeedbackModal",
  component: BaseFeedbackModal,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ minHeight: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ComUmBotao: Story = {
  args: {
    open: true,
    message: "Alterações salvas",
    onDismiss: () => {},
    children: (
      <button
        type="button"
        className="w-full rounded-md bg-interactive-default px-4 py-2 text-label-md text-text-inverse"
      >
        Ok!
      </button>
    ),
  },
};
