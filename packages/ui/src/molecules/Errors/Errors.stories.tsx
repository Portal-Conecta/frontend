import type { Meta, StoryObj } from '@storybook/react'

import { ErrorsPage } from './Errors'

const meta: Meta<typeof ErrorsPage> = {
    title: "Componentes/Feedback/ErrosPage",
    component: ErrorsPage,
    parameters: { layout: 'padded' },
    argTypes: {
        code: { control: 'text' },
        title: { control: 'text' },
        description: { control: 'text' },
    },
    args: {
        code: '404',
        title: 'Página não encontrada',
        description: 'Desculpe, a página que você está procurando não existe ou foi removida',
    },
}

export default meta
type Story = StoryObj<typeof ErrorsPage>

export const NotFound: Story = {}

export const ServerError: Story = {
    args: {
        code: '500',
        title: 'Erro interno do servidor',
        description: 'Algo deu errado do nosso lado. Tente novamente em alguns instantes',
    },
}

export const Forbidden: Story = {
    args: {
        code: '403',
        title: 'Acesso negado',
        description: 'Você não tem permissão para acessar esta página',
    },
}
