import type { Meta, StoryObj } from '@storybook/react'

import { ChecklistManagerItem } from './ChecklistManagerItem'

const meta = {
  title: 'Checklist/Molecules/ChecklistManagerItem',
  component: ChecklistManagerItem,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ChecklistManagerItem>

export default meta

type Story = StoryObj<typeof meta>

const args = {
  title: 'laboratório de informática',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  onEdit: () => {},
  onDelete: () => {},
}

export const Default: Story = { args }