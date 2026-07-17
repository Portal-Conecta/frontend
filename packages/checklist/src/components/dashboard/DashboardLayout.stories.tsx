import type { Meta, StoryObj } from '@storybook/react'

import { PageChecklistDashboardContent } from '../../pages/PageChecklistDashboard'
import { AlertaOrientacao } from './alerts'
import { DsBarChart, DsStackedBarChart, DsTrendLineChart } from './charts'
import { FALHAS_POR_CATEGORIA } from './data'
import { DashboardKpiGrid } from './kpis'
import { ZonaVermelhaTable } from './tables'

/**
 * Stories do layout corporativo do dashboard.
 * Menu Storybook: Checklist → Dashboard → Layout
 */
const meta: Meta = {
  title: 'Checklist/Dashboard/Layout',
  parameters: { layout: 'padded' },
}

export default meta

type Story = StoryObj

export const Completo: Story = {
  name: 'Tela completa (recomendado)',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-background-default p-6 md:p-8 lg:p-10">
      <PageChecklistDashboardContent useMock />
    </div>
  ),
}

export const Kpis: Story = {
  name: 'Cards KPI',
  render: () => (
    <div className="max-w-[1200px] bg-background-default p-6">
      <DashboardKpiGrid />
    </div>
  ),
}

export const TendenciaConformidade: Story = {
  name: 'Tendência de conformidade',
  render: () => (
    <div className="max-w-[900px] bg-background-default p-6">
      <DsTrendLineChart height={320} />
    </div>
  ),
}

export const FalhasPorCategoria: Story = {
  name: 'Falhas por categoria',
  render: () => (
    <div className="max-w-[480px] bg-background-default p-6">
      <DsBarChart title="Falhas por categoria" data={FALHAS_POR_CATEGORIA} height={320} />
    </div>
  ),
}

export const PerformancePorTurno: Story = {
  name: 'Performance por turno',
  render: () => (
    <div className="max-w-[640px] bg-background-default p-6">
      <DsStackedBarChart height={300} />
    </div>
  ),
}

export const ZonaVermelha: Story = {
  name: 'Zona vermelha',
  render: () => (
    <div className="max-w-[1100px] bg-background-default p-6">
      <ZonaVermelhaTable />
    </div>
  ),
}

export const AlertaOrientacaoStory: Story = {
  name: 'Alerta de orientação',
  render: () => (
    <div className="max-w-[560px] bg-background-default p-6">
      <AlertaOrientacao />
    </div>
  ),
}
