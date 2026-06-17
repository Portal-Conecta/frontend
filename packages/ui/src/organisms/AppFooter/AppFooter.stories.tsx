import type { Meta, StoryObj } from '@storybook/react'
import { AppFooter } from './AppFooter'
import { Icon } from '../../atoms/Icon'

function SidebarToggleButton({ expanded }: { expanded: boolean }) {
  return (
    <button
      type="button"
      className={[
        'flex h-full items-center gap-3 bg-background-default text-text-secondary text-[24px] font-afacad',
        'transition-all duration-300 ease-in-out overflow-hidden',
        expanded ? 'w-[254px] pl-9' : 'w-[96px] pl-8',
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

      <span
        className={[
          'whitespace-nowrap transition-opacity duration-300 ease-in-out',
          expanded ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      >
        Reduzir
      </span>
    </button>
  )
}

const meta: Meta<typeof AppFooter> = {
  title: 'Organisms/AppFooter',
  component: AppFooter,
  parameters: { layout: 'fullscreen' },
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
  args: {
    sidebarExpanded: false,
        leftSlot: (
        <button
            type="button"
            className="flex h-full w-[96px] pl-8 items-center gap-3 bg-background-default  text-text-secondary text-[24px] items-center
            font-afacad"        >
            <Icon name="chevrons-right" size="lg" tone="secondary" decorative />
        </button>
        ),
  },
}

export const ComSidebarExpandida: Story = {
  args: {
    sidebarExpanded: true,
        leftSlot: (
        <button
            type="button"
            className="flex h-full w-[254px] items-center gap-3 bg-background-default pl-9 text-text-secondary text-[24px] items-center
            font-afacad"        >
            <Icon name="chevrons-left" size="lg" tone="secondary" decorative />
            Reduzir
        </button>
        ),
  },
}

export const ComSidebarToggle: Story = {
  args: { sidebarExpanded: false},
  render: (args) => (
    <AppFooter
    {...args}
    leftSlot={<SidebarToggleButton expanded={args.sidebarExpanded ?? false} />}
    />
  ),
}