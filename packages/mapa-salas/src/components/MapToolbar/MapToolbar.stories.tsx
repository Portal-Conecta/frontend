// packages/mapa-salas/src/components/MapToolbar/MapToolbar.stories.tsx
//
// ⚠️ TEMPORÁRIA — só para teste visual local.
// Apagar antes do commit: componentes de domínio (packages/mapa-salas) não usam
// story, só packages/ui (ver precedente #147/#161 citado no issue #116).

import type { Meta, StoryObj } from '@storybook/react'

import { MapToolbar } from './MapToolbar'

const meta: Meta<typeof MapToolbar> = {
  title: 'TEMP/MapToolbar',
  component: MapToolbar,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof MapToolbar>

const noop = () => {}

/** mode='view' — Editar habilitado, Limpar e Salvar desabilitados. */
export const ModoVisualizacao: Story = {
  args: {
    mode: 'view',
    canSave: false,
    onEdit: noop,
    onClear: noop,
    onSave: noop,
  },
}

/** mode='edit' + canSave=false (ainda tem aluno pendente) — Limpar habilitado, Salvar cinza. */
export const ModoEdicaoPendente: Story = {
  args: {
    mode: 'edit',
    canSave: false,
    onEdit: noop,
    onClear: noop,
    onSave: noop,
  },
}

/** mode='edit' + canSave=true (todos alunos alocados) — Limpar e Salvar habilitados. */
export const ModoEdicaoCompleto: Story = {
  args: {
    mode: 'edit',
    canSave: true,
    onEdit: noop,
    onClear: noop,
    onSave: noop,
  },
}

/** Os três estados lado a lado, pra comparar rapidamente com os screenshots do frame. */
export const TodosOsEstados: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-label-sm-emphasis">view</p>
        <MapToolbar mode="view" canSave={false} onEdit={noop} onClear={noop} onSave={noop} />
      </div>
      <div>
        <p className="mb-2 text-label-sm-emphasis">edit, canSave=false</p>
        <MapToolbar mode="edit" canSave={false} onEdit={noop} onClear={noop} onSave={noop} />
      </div>
      <div>
        <p className="mb-2 text-label-sm-emphasis">edit, canSave=true</p>
        <MapToolbar mode="edit" canSave={true} onEdit={noop} onClear={noop} onSave={noop} />
      </div>
    </div>
  ),
}