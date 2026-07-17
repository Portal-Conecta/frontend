import type { Meta, StoryObj } from '@storybook/react'

import { PageChecklistDashboardContent } from './PageChecklistDashboardContent'

/**
 * Storybook — Dashboard completo dos Checklists (layout corporativo).
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
          'Dashboard dos Checklists | Portal Conecta WEG — KPIs, tendência de conformidade, falhas por categoria, performance por turno, zona vermelha e alertas de orientação.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof PageChecklistDashboardContent>

/** Página inteira com dados de referência (94,2% / 78,5% / 88,9% / 4,3% + gráficos + tabela). */
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

export const Loading: Story = {
  name: 'Carregando',
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
  // força loading: reutiliza o content com useMock mas o first paint já tem dados;
  // use story de DashboardKpiGrid Loading em vez disso se precisar só skeleton.
  render: () => (
    <div className="min-h-screen bg-background-default p-6 md:p-8 lg:p-10">
      <PageChecklistDashboardContent useMock />
    </div>
  ),
}
