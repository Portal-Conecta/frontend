// molecules/CourseCard/CourseCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'

import { CourseCard } from './CourseCard'

const meta = {
  title: 'Componentes/Seleção/CourseCard',
  component: CourseCard,
  parameters: { layout: 'padded' },
  args: {
    code: 'MIDS',
    courseName: 'Desenvolvimento de Sistemas',
  },
} satisfies Meta<typeof CourseCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Selected: Story = { args: { selected: true } }

export const WithAction: Story = {
  args: { onAction: () => alert('Gerenciar curso') },
}

export const ActionDisabled: Story = {
  args: { onAction: () => {}, actionDisabled: true },
}

export const Selectable: Story = {
  args: { onSelect: () => alert('Curso selecionado') },
}

/** Lista completa, espelhando a tela "Selecionar Curso". */
export const List: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-3">
      <CourseCard code="MIDS" courseName="Desenvolvimento de Sistemas" onSelect={() => {}} />
      <CourseCard
        code="MIDS"
        courseName="Desenvolvimento de Sistemas"
        selected
        onSelect={() => {}}
      />
      <CourseCard code="MIDS" courseName="Desenvolvimento de Sistemas" onSelect={() => {}} />
      <CourseCard
        code="MIDS"
        courseName="Desenvolvimento de Sistemas"
        onSelect={() => {}}
        onAction={() => alert('Gerenciar curso')}
      />
    </div>
  ),
}