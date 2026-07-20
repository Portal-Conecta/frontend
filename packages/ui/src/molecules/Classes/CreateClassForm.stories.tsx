import type { Meta, StoryObj } from '@storybook/react'

import { CreateClassForm } from './CreateClassForm'

const MOCK_COURSES = [
  { id: '1', code: 'MIDS', name: 'Desenvolvimento de Sistemas' },
  { id: '2', code: 'MIDS', name: 'Desenvolvimento de Sistemas' },
  { id: '3', code: 'MIDS', name: 'Desenvolvimento de Sistemas' },
  { id: '4', code: 'MIDS', name: 'Desenvolvimento de Sistemas' },
]

const meta: Meta<typeof CreateClassForm> = {
  title: 'Molecules/Classes/CreateClassForm',
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
    onSubmitClass: async (data) => {
      console.log('Dados submetidos no Storybook:', data)
      // Simula um delay de rede de 1 segundo e retorna sucesso
      return new Promise((resolve) => 
        setTimeout(() => resolve({ success: true }), 1000)
      )
    },
  },
}

export const ComErro: Story = {
  args: {
    onSubmitClass: async (data) => {
      console.log('Dados submetidos no Storybook (Erro):', data)
      return new Promise((resolve) => 
        setTimeout(() => resolve({ success: false, error: 'Erro inesperado' }), 1000)
      )
    },
  },
}

export const SemCursos: Story = {
  args: {
    courses: [],
    onSubmitClass: async () => ({ success: true }),
  },
}