import type { Metadata } from 'next'

import { AppShell } from '@portal/core'
import { getCurrentUser } from '@portal/core/auth/getCurrentUser'
import { Icon, Text, type IconName } from '@portal/ui'

export const metadata: Metadata = {
  title: 'Contato | Portal Conecta',
}

interface ContactChannel {
  icon: IconName
  label: string
  value: string
}

const contactChannels: readonly ContactChannel[] = [
  { icon: 'mail', label: 'Email', value: 'suporte@portalconecta.com.br' },
  { icon: 'phone', label: 'Telefone', value: '(47) 3333-3333' },
  { icon: 'map-pin', label: 'Localização', value: 'Jaraguá do Sul - SC' },
]

export default async function ContatoPage() {
  const user = await getCurrentUser()

  return (
    <AppShell user={user} activeKey="">
      <Text
        as="h1"
        variant="heading-h2"
        tone="brand"
        className="px-6 pt-2 text-xl md:text-2xl lg:text-3xl"
      >
        Contato
      </Text>

      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-20 pt-20 md:pb-24 md:pt-24 lg:pb-30 lg:pt-30">
        <section className="flex flex-col items-center text-center">
          <Text
            as="h2"
            variant="label-xl-emphasis"
            tone="brand"
            className="text-xl md:text-2xl lg:text-3xl"
          >
            Fale conosco
          </Text>
          <Text
            variant="body-md"
            tone="secondary"
            className="mt-4 max-w-2xl text-body-sm md:text-base lg:text-lg"
          >
            Entre em contato conosco através dos canais oficiais ou envie uma
            mensagem pelo formulário
          </Text>
        </section>

        <section
          aria-label="Canais de contato"
          className="mt-20 flex w-full max-w-3xl flex-col gap-8"
        >
          {contactChannels.map(({ icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-10 rounded-md border-sm border-border-disabled px-6 py-5 md:px-10"
            >
              <Icon name={icon} size="md" tone="primary" decorative />
              <div className="flex flex-col">
                <Text variant="label-md-emphasis" tone="primary">
                  {label}
                </Text>
                <Text variant="label-sm" tone="disabled">
                  {value}
                </Text>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-30 flex flex-col items-center text-center">
          <Text
            as="h2"
            variant="label-xl-emphasis"
            tone="brand"
            className="text-xl md:text-2xl lg:text-3xl"
          >
            Ainda precisa de ajuda?
          </Text>
          <Text
            variant="body-md"
            tone="secondary"
            className="mt-4 text-body-sm md:text-base lg:text-lg"
          >
            Consulte as respostas para as dúvidas mais comuns.
          </Text>
          <Text
            as="a"
            href="/ajuda"
            variant="body-md"
            tone="brand"
            className="mt-14 flex items-center gap-4 text-body-sm md:text-base lg:text-lg"
          >
            Acessar Central de Ajuda
            <Icon name="chevron-right" size="md" decorative />
          </Text>
        </section>
      </div>
    </AppShell>
  )
}
