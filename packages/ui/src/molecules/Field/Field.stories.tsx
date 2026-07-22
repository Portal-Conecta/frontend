import type { Meta, StoryObj } from '@storybook/react'

import { Input } from '@portal/ui/atoms'

import { Field } from './Field'

const meta: Meta<typeof Field> = {
  title: 'Componentes/Form/Field',
  component: Field,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-md rounded-md p-6">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Field>

export const Default: Story = {
  render: () => (
    <Field label="Título">
      <Input placeholder="placeholder" />
    </Field>
  ),
}

export const WithError: Story = {
  render: () => (
    <Field label="E-mail">
      <Input placeholder="seu@email.com" error="E-mail inválido." />
    </Field>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Field label="Campo desabilitado">
      <Input placeholder="Não editável" disabled />
    </Field>
  ),
}

export const Password: Story = {
  render: () => (
    <Field label="Senha">
      <Input placeholder="••••••••" type="password" />
    </Field>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <Field label="Busca">
      <Input placeholder="Pesquisar..." iconRight="search" />
    </Field>
  ),
}

export const Overlay: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-md rounded-md bg-interactive-default p-6">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Field label="Usuário" tone="overlay">
      <Input placeholder="Digite seu usuário" tone="overlay" />
    </Field>
  ),
}
