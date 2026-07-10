import type { Meta, StoryObj } from "@storybook/react";

import { AnnouncementFiltersBar } from "./AnnouncementFiltersBar";

const cursoOptions = [
  { value: "todos", label: "Todos" },
  {
    value: "desenvolvimento-de-sistemas",
    label: "Desenvolvimento de Sistemas",
  },
  { value: "eletromecanica", label: "Eletromecânica" },
];

const tipoOptions = [
  { value: "todos", label: "Todos" },
  { value: "aviso", label: "Aviso" },
  { value: "evento", label: "Evento" },
];

const turmaOptions = [
  { value: "todos", label: "Todos" },
  { value: "ds-2026", label: "DS 2026" },
  { value: "ds-2027", label: "DS 2027" },
];

const turnoOptions = [
  { value: "todos", label: "Todos" },
  { value: "matutino", label: "Matutino" },
  { value: "vespertino", label: "Vespertino" },
  { value: "noturno", label: "Noturno" },
];

const periodoOptions = [
  { value: "todos", label: "Todos" },
  { value: "hoje", label: "Hoje" },
  { value: "semana", label: "Esta semana" },
  { value: "mes", label: "Este mês" },
];

const meta: Meta<typeof AnnouncementFiltersBar> = {
  title: "Comunicados/Organisms/AnnouncementFiltersBar",
  component: AnnouncementFiltersBar,
  parameters: { layout: "padded" },
  args: {
    cursoOptions,
    tipoOptions,
    turmaOptions,
    turnoOptions,
    periodoOptions,
  },
  decorators: [
    (Story) => (
      <div className="w-[520px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AnnouncementFiltersBar>;

export const Default: Story = {
  args: {
    userType: "ADMIN",
    loading: false,
  },
};

export const VarianteAluno: Story = {
  args: {
    userType: "STUDENT",
    loading: false,
  },
};

export const Loading: Story = {
  args: {
    userType: "ADMIN",
    loading: true,
  },
};

export const SkeletonAluno: Story = {
  args: {
    userType: "STUDENT",
    loading: true,
  },
};
