import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { StatusToggle, type StatusValue } from "./StatusToggle";

const meta = {
  title: "Checklist/Atoms/StatusToggle",
  component: StatusToggle,
  parameters: { layout: "centered" },
  argTypes: {
    defaultValue: {
      control: "inline-radio",
      options: [null, "COMPLIANT", "NON_COMPLIANT"],
    },
  },
} satisfies Meta<typeof StatusToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ConformeSelecionado: Story = {
  args: { defaultValue: "COMPLIANT" },
};

export const NaoConformeSelecionado: Story = {
  args: { defaultValue: "NON_COMPLIANT" },
};

export const Disabled: Story = {
  args: { defaultValue: "COMPLIANT", disabled: true },
};

export const Controlado: Story = {
  render: () => {
    const [value, setValue] = useState<StatusValue | null>(null);
    return (
      <div className="flex flex-col items-center gap-3">
        <StatusToggle value={value} onChange={setValue} />
        <span className="text-label-sm text-text-secondary">
          valor: {value ?? "nenhum"}
        </span>
      </div>
    );
  },
};

export const Mobile: Story = {
  args: { defaultValue: "NON_COMPLIANT" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
