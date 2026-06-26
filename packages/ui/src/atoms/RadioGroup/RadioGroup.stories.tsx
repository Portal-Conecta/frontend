import { useId, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'

import { Text } from '../Text'
import { RadioGroup } from './RadioGroup'

const conformidadeOptions = [
  { value: 'conforme', label: 'Conforme' },
  { value: 'nao-conforme', label: 'Não conforme' },
] as const

const meta: Meta<typeof RadioGroup> = {
  title: 'Componentes/Inputs/Input/Radio',
  component: RadioGroup,
  parameters: { layout: 'padded' },
  argTypes: {
    direction: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
      description: 'Disposição das opções. Default `vertical`.',
    },
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Tamanho do ícone e do label. Default `md`.',
    },
    disabled: { control: 'boolean' },
    error: {
      control: 'text',
      description: 'Mensagem de erro. A presença ativa o estado de erro (barra + mensagem).',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md rounded-md p-6">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof RadioGroup>

const render: Story['render'] = (args) => {
  const [value, setValue] = useState(args.value ?? '')
  return <RadioGroup {...args} value={value} onChange={setValue} />
}

/** Playground — clique ou use as setas para navegar e selecionar. */
export const Default: Story = {
  args: {
    options: [
      { value: 'opcao-a', label: 'Opção A' },
      { value: 'opcao-b', label: 'Opção B' },
      { value: 'opcao-c', label: 'Opção C' },
    ],
    size: 'md',
  },
  render,
}

/** Disposição horizontal — opções lado a lado. */
export const Horizontal: Story = {
  args: {
    options: [
      { value: 'opcao-a', label: 'Opção A' },
      { value: 'opcao-b', label: 'Opção B' },
      { value: 'opcao-c', label: 'Opção C' },
    ],
    direction: 'horizontal',
    size: 'md',
  },
  render,
}

/** Tamanhos disponíveis: sm, md e lg — comparados lado a lado. */
export const Sizes: Story = {
  render: () => {
    const [xs, setXs] = useState('a')
    const [sm, setSm] = useState('a')
    const [md, setMd] = useState('a')
    const [lg, setLg] = useState('a')
    const sizeOptions = [
      { value: 'a', label: 'Opção A' },
      { value: 'b', label: 'Opção B' },
    ]

    return (
      <div className="flex flex-col items-start gap-4">
        <RadioGroup
          options={sizeOptions}
          value={xs}
          onChange={setXs}
          direction="horizontal"
          size="xs"
          aria-label="Tamanho mínimo"
        />
        <RadioGroup
          options={sizeOptions}
          value={sm}
          onChange={setSm}
          direction="horizontal"
          size="sm"
          aria-label="Tamanho pequeno"
        />
        <RadioGroup
          options={sizeOptions}
          value={md}
          onChange={setMd}
          direction="horizontal"
          size="md"
          aria-label="Tamanho médio"
        />
        <RadioGroup
          options={sizeOptions}
          value={lg}
          onChange={setLg}
          direction="horizontal"
          size="lg"
          aria-label="Tamanho grande"
        />
      </div>
    )
  },
}

/** Horizontal + tamanho grande. */
export const HorizontalLarge: Story = {
  args: {
    options: [...conformidadeOptions],
    direction: 'horizontal',
    size: 'lg',
    value: 'conforme',
  },
  render,
}

/** Caso de uso do checklist: conforme vs não conforme. */
export const Selected: Story = {
  args: {
    options: [...conformidadeOptions],
    value: 'conforme',
    size: 'md',
  },
  render,
}

export const Disabled: Story = {
  args: {
    options: [...conformidadeOptions],
    disabled: true,
    size: 'md',
  },
  render,
}

/** Opção individual desabilitada. */
export const OptionDisabled: Story = {
  args: {
    options: [
      { value: 'conforme', label: 'Conforme' },
      { value: 'nao-conforme', label: 'Não conforme', disabled: true },
    ],
    size: 'md',
  },
  render,
}

/** Erro: opções não selecionadas em feedback/error + mensagem (como no Input). */
export const ErrorState: Story = {
  args: {
    options: [...conformidadeOptions],
    error: 'Selecione uma opção.',
    size: 'md',
  },
  render,
}

/** Composição com label externo — padrão de integração com FormField. */
function WithLabelDemo() {
  const labelId = useId()
  const [value, setValue] = useState('')

  return (
    <div className="flex flex-col gap-2">
      <Text as="label" id={labelId} variant="body-md" tone="brand">
        Conformidade
      </Text>
      <RadioGroup
        options={[...conformidadeOptions]}
        value={value}
        onChange={setValue}
        aria-labelledby={labelId}
      />
    </div>
  )
}

export const WithLabel: Story = {
  render: () => <WithLabelDemo />,
}
