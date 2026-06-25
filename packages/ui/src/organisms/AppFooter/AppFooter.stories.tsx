import type { Meta, StoryObj } from '@storybook/react'
import { AppFooter } from './AppFooter'
import { Icon } from '../../atoms/Icon'
import { Text } from '../../atoms/Text'
import { SIDEBAR_WIDTH_COLLAPSED, SIDEBAR_WIDTH_EXPANDED } from '../../tokens'

function SidebarToggleButton({ expanded }: { expanded: boolean }) {
  return (
    <button
      type="button"
      style={{ width: expanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED }}
      className={[
        'flex h-full items-center gap-3 bg-background-default text-text-secondary',
        'overflow-hidden transition-all duration-300 ease-in-out',
        expanded ? 'pl-9' : 'pl-8',
      ].join(' ')}
    >
      <span
        className={[
          'inline-flex shrink-0 transition-transform duration-300 ease-in-out',
          expanded ? '-scale-x-100' : '',
        ].join(' ')}
      >
        <Icon name="chevrons-right" size="lg" tone="secondary" decorative />
      </span>

      <Text
        as="span"
        variant="body-md"
        tone="secondary"
        className={[
          'whitespace-nowrap transition-opacity duration-300 ease-in-out',
          expanded ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      >
        Reduzir
      </Text>
    </button>
  )
}

const meta: Meta<typeof AppFooter> = {
  title: 'Organisms/AppFooter',
  component: AppFooter,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    sidebarExpanded: {
      control: 'boolean',
      description:
        'Alinha a largura da coluna esquerda ao estado da sidebar (colapsada 96px / expandida 254px).',
    },
    leftSlot: {
      control: false,
      description:
        'Conteúdo da coluna esquerda alinhada à sidebar (ex.: botão de reduzir). Visível só em ≥lg.',
    },
  },
}

export default meta
type Story = StoryObj<typeof AppFooter>

export const Default: Story = {
  args: { sidebarExpanded: false },
  render: (args) => (
    <AppFooter
      {...args}
      leftSlot={<SidebarToggleButton expanded={args.sidebarExpanded ?? false} />}
    />
  ),
}

export const ComSidebarColapsada: Story = {
  args: { sidebarExpanded: false },
  render: (args) => (
    <AppFooter
      {...args}
      leftSlot={<SidebarToggleButton expanded={args.sidebarExpanded ?? false} />}
    />
  ),
}

export const ComSidebarExpandida: Story = {
  args: { sidebarExpanded: true },
  render: (args) => (
    <AppFooter
      {...args}
      leftSlot={<SidebarToggleButton expanded={args.sidebarExpanded ?? false} />}
    />
  ),
}

export const ComSidebarToggle: Story = {
  args: { sidebarExpanded: false },
  render: (args) => (
    <AppFooter
      {...args}
      leftSlot={<SidebarToggleButton expanded={args.sidebarExpanded ?? false} />}
    />
  ),
}
