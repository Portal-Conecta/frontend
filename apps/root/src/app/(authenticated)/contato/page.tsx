import type { Metadata } from 'next'

import { Icon, Text, type IconName } from '@portal/ui'

export const metadata: Metadata = {
  title: 'Contato | Portal Conecta',
}

interface ContactChannel {
  icon: IconName
  label: string
  value: string
  href?: string
}

const contactChannels: readonly ContactChannel[] = [
  {
    icon: 'mail',
    label: 'Email',
    value: 'suporte@portalconecta.com.br',
    href: 'mailto:suporte@portalconecta.com.br',
  },
  {
    icon: 'phone',
    label: 'Telefone',
    value: '(47) 3333-3333',
    href: 'tel:+554733333333',
  },
  { icon: 'map-pin', label: 'Localização', value: 'Jaraguá do Sul - SC' },
]

export default function ContatoPage() {
  return (
    <>
      <Text
        as="h1"
        variant="heading-h3"
        tone="brand"
        className="px-6 pt-2 md:text-heading-h2"
      >
        Contato
      </Text>

      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-20 pt-20 md:pb-24 md:pt-24 lg:pb-30 lg:pt-30">
        <section className="flex flex-col items-center text-center">
          <Text
            as="h2"
            variant="heading-h3"
            tone="brand"
            className="md:text-heading-h2"
          >
            Fale conosco
          </Text>
          <Text
            variant="body-sm"
            tone="secondary"
            className="mt-4 max-w-2xl md:text-body-md"
          >
            Entre em contato conosco através dos canais oficiais.
          </Text>
        </section>

        <section
          aria-label="Canais de contato"
          className="mt-20 flex w-full max-w-3xl flex-col gap-8"
        >
          {contactChannels.map(({ icon, label, value, href }) => (
            <div
              key={label}
              className="flex items-center gap-10 rounded-md border-sm border-border-disabled px-6 py-5 md:px-10"
            >
              <Icon name={icon} size="md" tone="primary" decorative />
              <div className="flex flex-col">
                <Text variant="label-md-emphasis" tone="primary">
                  {label}
                </Text>
                {href ? (
                  <Text
                    as="a"
                    href={href}
                    variant="label-sm"
                    tone="disabled"
                    className="hover:text-text-brand hover:underline"
                  >
                    {value}
                  </Text>
                ) : (
                  <Text variant="label-sm" tone="disabled">
                    {value}
                  </Text>
                )}
              </div>
            </div>
          ))}
        </section>

        <section className="mt-30 flex flex-col items-center text-center">
          <Text
            as="h2"
            variant="heading-h3"
            tone="brand"
            className="md:text-heading-h2"
          >
            Ainda precisa de ajuda?
          </Text>
          <Text
            variant="body-sm"
            tone="secondary"
            className="mt-4 md:text-body-md"
          >
            Consulte as respostas para as dúvidas mais comuns.
          </Text>
          <Text
            as="a"
            href="/ajuda"
            variant="body-sm"
            tone="brand"
            className="mt-14 flex items-center gap-4 md:text-body-md"
          >
            Acessar Central de Ajuda
            <Icon name="chevron-right" size="md" decorative />
          </Text>
        </section>
      </div>
    </>
  )
}
