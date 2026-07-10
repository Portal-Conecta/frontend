import type { Meta, StoryObj } from '@storybook/react'
import { RoomListItem } from './RoomListItem'

const meta = {
  title: 'Checklist/Atoms/RoomListItem',
  component: RoomListItem,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof RoomListItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { number: 204, name: 'Laboratório de informática' },
}