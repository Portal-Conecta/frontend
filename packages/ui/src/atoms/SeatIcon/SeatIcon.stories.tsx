import type { Meta, StoryObj } from '@storybook/react'
import { SeatIcon } from './SeatIcon'

const meta = {
  title: 'Atoms/SeatIcon',
  component: SeatIcon,
  parameters: { layout: 'centered' },
  args: {
    variant: 'student',
    size: 'md',
  },
} satisfies Meta<typeof SeatIcon>
 
export default meta
type Story = StoryObj<typeof meta>
 
/** Assento vazio — sem aluno alocado */
export const Empty: Story = {
  decorators: [(Story) => <div className="text-text-secondary"><Story /></div>],
}

/** Assento ocupado — com aluno alocado */
export const Occupied: Story = {
  decorators: [(Story) => <div className="text-interactive-default"><Story /></div>],
}
 
/** Tamanho pequeno */
export const Small: Story = {
  args: { size: 'sm' },
  decorators: [(Story) => <div className="text-text-secondary"><Story /></div>],
}

/** Todos os estados */
export const AllStates: Story = {
  render: () => (
    <div className="flex items-end gap-8">
      <div className="flex flex-col items-center gap-2">
        <SeatIcon size="md" className="text-text-secondary" />
        <span className="text-label-xs text-text-secondary">vazio</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <SeatIcon size="md" className="text-interactive-default" />
        <span className="text-label-xs text-text-secondary">ocupado</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <SeatIcon size="sm" className="text-text-secondary" />
        <span className="text-label-xs text-text-secondary">vazio sm</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <SeatIcon size="sm" className="text-interactive-default" />
        <span className="text-label-xs text-text-secondary">ocupado sm</span>
      </div>
    </div>
  ),
}