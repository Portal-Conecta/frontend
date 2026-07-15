import type { Meta, StoryObj } from '@storybook/react'
import { NotificationListItem } from './NotificationListItem'

const meta = {
  title: 'Componentes/Data/NotificationListItem',
  component: NotificationListItem,
  parameters: { 
    // Layout padded para dar espaço ao redor do item na pré-visualização
    layout: 'padded' 
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['CHECKLIST', 'MAPA', 'COMUNICADO', 'OUTRO'],
      description: 'Define o ícone apresentado com base no tipo de notificação.',
    },
    isRead: {
      control: 'boolean',
      description: 'Define o estado inicial de leitura (true = ícone cinzento, false = ícone com cor da marca).',
    },
    onMarkAsRead: {
      action: 'Notificação marcada como lida no backend',
      description: 'Callback acionado no momento em que o utilizador abre o pop-up de uma notificação não lida.',
    },
  },
  // Argumentos base que serão partilhados por todas as stories
  args: {
    title: 'Checklist de Manutenção Finalizado',
    body: 'Este é o corpo da notificação. Aqui estará o texto longo detalhando o que aconteceu no checklist de manutenção, permitindo ao utilizador ler toda a informação necessária diretamente no pop-up.',
    dateText: 'Ontem, 14:30',
    type: 'CHECKLIST',
    isRead: false,
  },
} satisfies Meta<typeof NotificationListItem>

export default meta
type Story = StoryObj<typeof meta>

// 1. Notificação Não Lida (Estado Inicial Padrão)
// Clique nesta story no Storybook para ver o modal a abrir e o ícone a mudar de cor.
export const Unread: Story = {}

// 2. Notificação Já Lida
export const Read: Story = {
  args: {
    isRead: true,
    title: 'Relatório Mensal Disponível',
    type: 'COMUNICADO',
  },
}

// 3. Variação: Mapa
export const TypeMap: Story = {
  args: {
    title: 'Nova Rota Atribuída',
    body: 'Foi-lhe atribuída uma nova rota de entrega. Por favor, verifique as atualizações no mapa do sistema.',
    type: 'MAPA',
  },
}

// 4. Variação: Comunicado
export const TypeNotice: Story = {
  args: {
    title: 'Atualização de Políticas de Segurança',
    body: 'Informamos que as políticas de segurança foram atualizadas. Por favor, leia o novo documento disponível na intranet.',
    type: 'COMUNICADO',
  },
}

// 5. Variação: Outro (Sino padrão)
export const TypeOther: Story = {
  args: {
    title: 'Manutenção Programada do Sistema',
    body: 'O sistema estará indisponível no próximo sábado entre as 02:00 e as 04:00 para manutenção.',
    type: 'OUTRO',
  },
}