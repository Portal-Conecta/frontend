import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { SelectOption } from "@portal/ui";

import { ChecklistFilters } from "./ChecklistFilters";

const groupOptions: SelectOption[] = [
  { value: "turma-a", label: "Turma A" },
  { value: "turma-b", label: "Turma B" },
  { value: "turma-c", label: "Turma C" },
];

const roomOptions: SelectOption[] = [
  { value: "sala-101", label: "Sala 101" },
  { value: "sala-102", label: "Sala 102" },
  { value: "sala-204", label: "Sala 204" },
  { value: "lab-informatica", label: "Laboratório de Informática" },
];

const meta: Meta<typeof ChecklistFilters> = {
  title: "Checklist/Organisms/ChecklistFilters",
  component: ChecklistFilters,
  parameters: { layout: "padded" },
  args: {
    groupOptions,
    roomOptions,
  },
  argTypes: {
    onApply: { control: false },
    onReset: { control: false },
    periodOptions: { control: false },
    groupOptions: { control: false },
    roomOptions: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof ChecklistFilters>;

export const Default: Story = {
  args: { loading: false },
};

export const Loading: Story = {
  args: { loading: true },
};

const withAppliedLog: NonNullable<Story["render"]> = (args) => {
  const [applied, setApplied] = useState<string>(
    "(nenhum filtro aplicado ainda)",
  );
  return (
    <div className="flex flex-col gap-4">
      <ChecklistFilters
        {...args}
        onApply={(filters) => setApplied(JSON.stringify(filters, null, 2))}
      />
      <pre className="rounded-md bg-background-default p-4 text-label-xs">
        {applied}
      </pre>
    </div>
  );
};

export const ComLogDeAplicacao: Story = {
  render: withAppliedLog,
};
