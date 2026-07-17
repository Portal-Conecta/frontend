import type { Meta, StoryObj } from '@storybook/react'

import { PageChecklistDashboardContent } from './PageChecklistDashboardContent'

/**
 * Storybook — Dashboard completo (payload alinhado ao backend).
 *
 * Menu: Checklist → Dashboard → Page → Demo
 */
const meta: Meta<typeof PageChecklistDashboardContent> = {
  title: 'Checklist/Dashboard/Page',
  component: PageChecklistDashboardContent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Dashboard dos Checklists | Portal Conecta WEG — KPIs derivados + 6 gráficos do GET /api/checklist-stats/dashboard (via BFF).',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof PageChecklistDashboardContent>

/** Página com MOCK_DASHBOARD_STATS (mesmo shape do backend). */
export const Demo: Story = {
  name: 'Dashboard completo',
  args: {
    useMock: true,
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background-default p-6 md:p-8 lg:p-10">
        <Story />
      </div>
    ),
  ],
}
