import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react'

import { Pagination } from './Pagination'

/**
 * Wrapper controlado — o `Pagination` não gerencia a própria página, só
 * emite `onPageChange`.
 */
function ControlledPagination({
  initialPage,
  pageSize,
  totalItems,
  disabled,
}: {
  initialPage: number
  pageSize: number
  totalItems: number
  disabled?: boolean
}) {
  const [currentPage, setCurrentPage] = useState(initialPage)

  return (
    <Pagination
      currentPage={currentPage}
      pageSize={pageSize}
      totalItems={totalItems}
      onPageChange={setCurrentPage}
      disabled={disabled ?? false}
    />
  )
}

const meta: Meta<typeof Pagination> = {
  title: 'Componentes/Navegação/Pagination',
  component: Pagination,
  parameters: { layout: 'padded' },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Desabilita os dois botões (ex.: lista carregando).',
    },
  },
  args: {
    disabled: false,
  },
}

export default meta
type Story = StoryObj<typeof Pagination>

export const Default: Story = {
  render: (args) => (
    <ControlledPagination initialPage={3} pageSize={20} totalItems={85} disabled={args.disabled ?? false} />
  ),
}

export const PrimeiraPagina: Story = {
  render: (args) => (
    <ControlledPagination initialPage={1} pageSize={20} totalItems={85} disabled={args.disabled ?? false} />
  ),
}

export const UltimaPagina: Story = {
  render: (args) => (
    <ControlledPagination initialPage={5} pageSize={20} totalItems={85} disabled={args.disabled ?? false} />
  ),
}

export const ListaVazia: Story = {
  render: (args) => (
    <ControlledPagination initialPage={1} pageSize={20} totalItems={0} disabled={args.disabled ?? false} />
  ),
}

export const Desabilitado: Story = {
  args: { disabled: true },
  render: (args) => (
    <ControlledPagination initialPage={3} pageSize={20} totalItems={85} disabled={args.disabled ?? false} />
  ),
}