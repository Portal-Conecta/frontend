import type { Meta, StoryObj } from "@storybook/react";
import { ChecklistItemResult } from "./ChecklistItemResult";

const meta = {
  title: "Checklist/Molecules/ChecklistItemResult",
  component: ChecklistItemResult,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ChecklistItemResult>;

export default meta;
type Story = StoryObj<typeof meta>;

const desc = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

export const Conforme: Story = {
  args: {
    title: "Ar Condicionado",
    description: desc,
    status: "COMPLIANT",
  },
};

export const NaoConforme: Story = {
  args: {
    title: "Computadores",
    description: desc,
    status: "NON_COMPLIANT",
    observation:
      "3 Computadores apresentam problemas para se conectar com a internet. Acho que os cabos de rede estão com algum mal contato.",
  },
};

export const Lista: Story = {
  args: { title: "", status: "COMPLIANT" },
  render: () => (
    <div className="max-w-5xl">
      <ChecklistItemResult
        title="Ar Condicionado"
        description={desc}
        status="COMPLIANT"
      />
      <ChecklistItemResult
        title="Computadores"
        description={desc}
        status="NON_COMPLIANT"
        observation="3 Computadores apresentam problemas para se conectar com a internet. Acho que os cabos de rede estão com algum mal contato."
      />
      <ChecklistItemResult
        title="Periféricos"
        description={desc}
        status="COMPLIANT"
      />
    </div>
  ),
};
