import type { Meta, StoryObj } from '@storybook/react'

import { CourseRow } from './CourseRow'

/**
 * CourseRow — linha da lista de cursos (código │ nome │ Gerenciar).
 *
 * Redimensione o viewport: no desktop a ação é o botão "Gerenciar"; no mobile
 * (fiel ao frame, sem botão na linha) a linha inteira vira o alvo tocável.
 */
const meta: Meta<typeof CourseRow> = {
  title: 'Cursos/Molecules/CourseRow',
  component: CourseRow,
  parameters: { layout: 'padded' },
  args: {
    course: { id: 'c-mids', code: 'MIDS', name: 'Desenvolvimento de Sistemas' },
    onManage: () => {},
  },
}

export default meta
type Story = StoryObj<typeof CourseRow>

export const Padrao: Story = {}

export const NomeLongo: Story = {
  args: {
    course: {
      id: 'c-mads',
      code: 'MADS',
      name: 'Análise e Desenvolvimento de Sistemas para a Indústria 4.0',
    },
  },
}

export const Lista: Story = {
  render: (args) => (
    <div className="w-full">
      <CourseRow {...args} course={{ id: '1', code: 'MIDS', name: 'Desenvolvimento de Sistemas' }} />
      <CourseRow {...args} course={{ id: '2', code: 'MELE', name: 'Eletrotécnica' }} />
      <CourseRow {...args} course={{ id: '3', code: 'MMEC', name: 'Mecânica Industrial' }} />
    </div>
  ),
}
