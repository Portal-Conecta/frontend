import type { Meta, StoryObj } from '@storybook/react'

import { AppHeader } from './AppHeader'

const meta: Meta<typeof AppHeader> = {
  title: 'Componentes/Navegação/AppHeader',
  component: AppHeader,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    sidebarExpanded: {
      control: 'boolean',
      description:
        'Espelha o estado da Sidebar (controlado pelo AppLayout). No desktop, expande o bloco da logo e troca a marca (ícone) pela versão completa.',
    },
    onLogoClick: { control: false, description: 'Clique na logo — navegação para a home.' },
    onNotificationsClick: { control: false, description: 'Clique no ícone de notificações (bell).' },
    hasUnreadNotifications: {
      control: 'boolean',
      description: 'Há notificação não lida — sobrepõe um dot vermelho no sino.',
    },
    onProfileClick: { control: false, description: 'Clique no ícone de perfil (circle-user).' },
    profileMenuOpen: {
      control: 'boolean',
      description: 'Menu de perfil aberto — vira aria-expanded no botão (circle-user).',
    },
  },
  args: {
    sidebarExpanded: false,
  },
}

export default meta
type Story = StoryObj<typeof AppHeader>

/** Mobile (base): logo-mark à esquerda + ações dentro da pílula. */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

/** Tablet (md): igual ao mobile — logo-mark + pílula de ações. */
export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
}

/** Desktop com a sidebar colapsada: logo-mark sobre o rail de 96px, ações soltas. */
export const DesktopColapsada: Story = {
  args: { sidebarExpanded: false },
}

/** Desktop com a sidebar expandida: logo-full sobre o rail de 254px, ações soltas. */
export const DesktopExpandida: Story = {
  args: { sidebarExpanded: true },
}

/** Desktop com notificação não lida: sino azul com um dot vermelho sobreposto. */
export const ComNotificacaoNaoLida: Story = {
  args: { sidebarExpanded: true, hasUnreadNotifications: true },
}
