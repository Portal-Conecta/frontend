import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "atoms/Checkbox",
  component: Checkbox,
  parameters: { layout: "padded" },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
      description: "Tamanho do ícone. Default `md`.",
    },
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md rounded-md p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

// Toggle controlado. Hover (blue-300) e pressed (active) são CSS do próprio
// átomo — funcionam aqui e em qualquer molecule que o importe, sem wrapper.
const render: Story["render"] = (args) => {
  const [checked, setChecked] = useState(args.checked ?? false);
  return <Checkbox {...args} checked={checked} onChange={setChecked} />;
};

/** Playground — passe o mouse para o hover suave, segure para o pressed, clique para marcar. */
export const Default: Story = {
  args: { label: "Checkbox Item", size: "md" },
  render,
};

/** Marcado: cor de brand fixa (não muda no hover). */
export const Checked: Story = {
  args: { label: "Checkbox Item", size: "md", checked: true },
  render,
};

export const Disabled: Story = {
  args: { label: "Checkbox Item", size: "md", disabled: true },
  render,
};
