import type { Meta, StoryObj } from '@storybook/react'

import { ComunicadosEmptyState } from './ComunicadosEmptyState'

const meta: Meta<typeof ComunicadosEmptyState> = {
  title: 'Comunicados/Molecules/ComunicadosEmptyState',
  component: ComunicadosEmptyState,
  parameters: { layout: 'padded' },
  args: {
    title: 'Comunicados não carregados',
    description: 'Não foi possível carregar os comunicados. Tente novamente mais tarde.',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Error: Story = {
  args: {
    actionLabel: 'Tentar novamente',
    onAction: () => undefined,
  },
}

export const EmptyWithCreate: Story = {
  args: {
    title: 'Nenhum comunicado encontrado',
    description: 'Quando houver comunicados, eles aparecerão aqui.',
    actionLabel: 'Criar comunicado',
    actionHref: '/comunicados/criar',
  },
}

export const EmptyWithoutAction: Story = {
  args: {
    title: 'Nenhum comunicado encontrado',
    description: 'Quando houver comunicados, eles aparecerão aqui.',
  },
}
