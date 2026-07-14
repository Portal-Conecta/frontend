import type { Meta, StoryObj } from "@storybook/react";
import { RoomSelector } from "./RoomSelector";

const meta = {
  title: "Checklist/Molecules/RoomSelector",
  component: RoomSelector,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof RoomSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

const rooms = [
  { id: "1", number: 204, name: "Laboratório de informática" },
  { id: "2", number: 203, name: "Laboratório de informática" },
  { id: "3", number: 202, name: "Laboratório de informática" },
  { id: "4", number: 201, name: "Laboratório de informática" },
];

export const Default: Story = {
  args: { rooms, onSelect: (r) => console.log("selecionou", r) },
};

export const Mobile: Story = {
  args: { rooms, onSelect: (r) => console.log("selecionou", r) },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
