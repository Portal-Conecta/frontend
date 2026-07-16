import type { Meta, StoryObj } from "@storybook/react";

import { RoomSelector } from "./RoomSelector";

const rooms = [
  { id: "1", number: 101, name: "Sala de Reuniões" },
  { id: "2", number: 204, name: "Laboratório de Informática" },
  { id: "3", number: 210, name: "Auditório" },
  { id: "4", number: 305, name: "Sala de Aula" },
  { id: "5", number: 312, name: "Biblioteca" },
];

const meta = {
  title: "Checklist/Molecules/RoomSelector",
  component: RoomSelector,
  parameters: { layout: "padded" },
  args: {
    rooms,
    onSelect: (room) => console.log("selecionada:", room),
  },
} satisfies Meta<typeof RoomSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};
