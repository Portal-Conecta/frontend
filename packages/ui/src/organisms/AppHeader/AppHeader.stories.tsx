import type { Meta, StoryObj } from '@storybook/react'
import { AppHeader } from './AppHeader'

const meta: Meta<typeof AppHeader> = {
  title: 'Organisms/AppHeader',
  component: AppHeader,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    sidebarExpanded: { control: 'boolean' },
    unreadNotificationsCount: { control: { type: 'number', min: 0, max: 99 } },
  },
  args: {
    sidebarExpanded: false,
    unreadNotificationsCount: 0,
  },
}

export default meta
type Story = StoryObj<typeof AppHeader>

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
}

export const DesktopSidebarColapsada: Story = {
  args: { sidebarExpanded: false },
}

export const DesktopSidebarExpandida: Story = {
  args: { sidebarExpanded: true },
}

export const ComNotificacoes: Story = {
  args: { sidebarExpanded: true, unreadNotificationsCount: 5 },
}