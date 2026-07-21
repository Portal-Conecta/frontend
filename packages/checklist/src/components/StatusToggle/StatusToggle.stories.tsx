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
      options: [null, "conforme", "nao-conforme"],
    },
  },
} satisfies Meta<typeof StatusToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ConformeSelecionado: Story = {
  args: { defaultValue: "conforme" },
};

export const NaoConformeSelecionado: Story = {
  args: { defaultValue: "nao-conforme" },
};

export const Disabled: Story = {
  args: { defaultValue: "conforme", disabled: true },
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
  args: { defaultValue: "nao-conforme" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

/** Confere no desktop que os dois botões têm a mesma caixa (md:w-30). */
export const BotoesMesmoTamanho: Story = {
  args: { defaultValue: "conforme" },
  parameters: { layout: "centered" },
};
