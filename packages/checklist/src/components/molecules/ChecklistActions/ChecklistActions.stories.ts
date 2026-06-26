import type { Meta, StoryObj } from '@storybook/react'
import { ChecklistActions } from './ChecklistActions'

const meta = {
  title: 'Checklist/Molecules/ChecklistActions',
  component: ChecklistActions,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ChecklistActions>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onSubmit: () => console.log('enviado'),
  },
}

export const SubmitDisabled: Story = {
  args: {
    ...Default.args,
    isSubmitDisabled: true,
  },
}

export const Submitting: Story = {
  args: {
    ...Default.args,
    isSubmitting: true,
  },
}