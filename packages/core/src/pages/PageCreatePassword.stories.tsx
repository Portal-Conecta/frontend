import type { Meta, StoryObj } from '@storybook/react'

import { PageCreatePassword } from './PageCreatePassword'

/**
 * Tela de criação de senha do primeiro acesso ("Ativar Conta").
 *
 * Nota: a ilustração do painel direito mora em `apps/root/public` e não é
 * servida pelo Storybook — no canvas ela aparece quebrada. O painel azul, que é
 * o conteúdo desta tela, renderiza normalmente. Para ver sem o buraco, use a
 * story `Mobile` (abaixo de 1024px o painel direito nem é montado).
 */
const meta: Meta<typeof PageCreatePassword> = {
  title: 'Componentes/Layout/PageCreatePassword',
  component: PageCreatePassword,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    onSubmit: {
      control: false,
      description: 'Recebe a senha já validada. A chamada ao BFF de ativação é de quem consome.',
    },
    loading: { control: 'boolean', description: 'Estado de carregando do botão.' },
    error: { control: 'text', description: 'Erro vindo do BFF (token expirado, serviço fora…).' },
  },
}

export default meta
type Story = StoryObj<typeof PageCreatePassword>

/** Estado inicial, como o usuário chega pelo link de ativação do e-mail. */
export const Default: Story = {}

/**
 * Abaixo de 1024px o `AuthLayout` esconde o painel da ilustração e o conteúdo
 * centraliza — é também a story que renderiza íntegra no Storybook.
 */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

/** Botão em carregando, enquanto a ativação corre no BFF. */
export const Loading: Story = {
  args: { loading: true },
}

/** Falha vinda do BFF — token de ativação expirado ou já utilizado (400). */
export const ComErroDeAtivacao: Story = {
  args: { error: 'Link de ativação expirado ou já utilizado. Solicite um novo à secretaria.' },
}
