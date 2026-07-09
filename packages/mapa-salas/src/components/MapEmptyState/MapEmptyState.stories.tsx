import type { Meta, StoryObj } from '@storybook/react'

import { MapEmptyState } from './MapEmptyState'

const meta = {
  title: 'Domains/MapaSalas/MapEmptyState',
  component: MapEmptyState,
  parameters: { layout: 'centered' },
  argTypes: {
    onCreateMap: { action: 'criar mapa clicado' },
  },
  args: {
    onCreateMap: () => {},
  },
} satisfies Meta<typeof MapEmptyState>

export default meta
type Story = StoryObj<typeof meta>

/** Estado padrão: sem mapa configurado para a sala/turma selecionada. */
export const Default: Story = {}

/**
 * Em um container estreito, para validar que o texto quebra corretamente
 * (ver remoção do whitespace-nowrap no título) e que o layout não estoura.
 */
export const ContainerEstreito: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
}

/**
 * Sobre fundo escuro/surface, para conferir o contraste de
 * text-text-disabled (ou text-text-secondary, se a cor for trocada
 * depois da confirmação com o frame 3 do Figma).
 */
export const SobreSurface: Story = {
  decorators: [
    (Story) => (
      <div className="bg-background-surface p-8 rounded-lg">
        <Story />
      </div>
    ),
  ],
}