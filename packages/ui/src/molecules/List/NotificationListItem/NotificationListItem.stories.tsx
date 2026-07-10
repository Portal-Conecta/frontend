import type { Meta, StoryObj } from '@storybook/react'
import { NotificationListItem } from './NotificationListItem'

const meta = {
  title: 'Moléculas/Listas/NotificationListItem',
  component: NotificationListItem,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['CHECKLIST', 'MAPA', 'COMUNICADO', 'OUTRO'],
      description: 'Define o ícone renderizado',
    },
    isRead: {
      control: 'boolean',
      description: 'Define se a notificação já foi lida (ícone cinza)',
    },
    onClick: { action: 'clicked', description: 'Acionado ao clicar no card' },
  },
  args: {
    title: 'Checklist de Manutenção Finalizado',
    dateText: 'Ontem, 14:30',
    type: 'CHECKLIST',
    isRead: false,
  },
} satisfies Meta<typeof NotificationListItem>

export default meta

type Story = StoryObj<typeof meta>

export const NaoLida: Story = {
  args: {
    isRead: false,
  },
}

export const Lida: Story = {
  args: {
    isRead: true,
  },
}

export const TipoMapa: Story = {
  args: {
    title: 'Novo mapa de colheita disponível',
    type: 'MAPA',
    isRead: false,
  },
}

export const TipoComunicado: Story = {
  args: {
    title: 'Atualização nas políticas de segurança',
    type: 'COMUNICADO',
    isRead: true,
  },
}

export const TipoOutro: Story = {
  args: {
    title: 'Lembrete de reunião de alinhamento',
    type: 'OUTRO',
    isRead: false,
  },
}