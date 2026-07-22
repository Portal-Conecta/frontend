import type { Meta, StoryObj } from '@storybook/react'

import { CreateClassForm } from './CreateClassForm'

const MOCK_COURSES = [
  { id: '1', code: 'MIDS', name: 'Desenvolvimento de Sistemas' },
  { id: '2', code: 'MADS', name: 'Análise e Desenvolvimento de Sistemas' },
  { id: '3', code: 'MELT', name: 'Eletrotécnica' },
  { id: '4', code: 'MMEC', name: 'Mecânica' },
]

const meta: Meta<typeof CreateClassForm> = {
  title: 'Turmas/CreateClassForm',
  component: CreateClassForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    courses: MOCK_COURSES,
  },
}

export default meta

type Story = StoryObj<typeof CreateClassForm>

export const Default: Story = {
  args: {
    onSubmitClass: async () =>
      new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000)),
  },
}

export const ComErro: Story = {
  args: {
    onSubmitClass: async () =>
      new Promise((resolve) =>
        setTimeout(() => resolve({ success: false, error: 'Erro inesperado' }), 1000),
      ),
  },
}

export const SemCursos: Story = {
  args: {
    courses: [],
    onSubmitClass: async () => ({ success: true }),
  },
}

export const FalhaAoCarregar: Story = {
  args: {
    courses: [],
    coursesLoadFailed: true,
    onSubmitClass: async () => ({ success: true }),
  },
}
