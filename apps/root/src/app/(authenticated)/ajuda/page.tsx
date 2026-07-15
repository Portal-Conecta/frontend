import type { Metadata } from 'next'

import { AppShell } from '@portal/core'
import { getCurrentUser } from '@portal/core/auth/getCurrentUser'
import { Icon, Text } from '@portal/ui'

export const metadata: Metadata = {
  title: 'Central de Ajuda | Portal Conecta',
}

interface FaqItem {
  question: string
  answer: string
}

const faqItems: readonly FaqItem[] = [
  {
    question: 'Como altero minha senha de acesso?',
    answer:
      'Acesse o menu "Perfil" no canto superior direito, selecione "Segurança" e clique em "Alterar Senha". Siga as instruções enviadas para o seu e-mail corporativo cadastrado.',
  },
  {
    question: 'Como visualizo meus comunicados?',
    answer:
      'Os comunicados podem ser vistos pelo menu lateral, em "Comunicados", ou pelo seu e-mail corporativo.',
  },
  {
    question: 'Onde encontro meu mapa de sala?',
    answer:
      'A localização da sua sala fica disponível na seção "Mapa de Sala" do menu principal.',
  },
  {
    question: 'Como solicito um novo crachá?',
    answer:
      'Abra um ticket em "RH/Facilidades" ou entre em contato diretamente com o setor administrativo para solicitar a emissão de um novo crachá.',
  },
]

export default async function AjudaPage() {
  const user = await getCurrentUser()

  return (
    <AppShell user={user} activeKey="">
      <Text
        as="h1"
        variant="heading-h3"
        tone="brand"
        className="px-6 pt-2 md:text-heading-h2"
      >
        Central de Ajuda
      </Text>

      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 py-20">
        <div className="flex flex-col items-center text-center">
          <Text
            as="h2"
            variant="heading-h3"
            tone="brand"
            className="md:text-heading-h2"
          >
            Perguntas Frequentes
          </Text>
          <Text
            variant="body-sm"
            tone="secondary"
            className="max-w-2xl text-center md:text-body-md"
          >
            Encontre respostas rápidas para suas dúvidas ou explore nossos
            tópicos de suporte.
          </Text>
        </div>

        <div className="flex w-full flex-col gap-3 md:mx-auto md:max-w-2xl lg:max-w-full">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-md border-sm border-border-disabled text-text-secondary open:border-interactive-disabled open:text-text-brand"
            >
              <summary className="flex w-full cursor-pointer list-none items-center justify-between px-6 py-3 text-label-sm md:p-4 md:text-label-md lg:p-5">
                {item.question}
                <Icon
                  name="chevron-down"
                  size="md"
                  className="text-text-secondary transition-transform group-open:rotate-180"
                  decorative
                />
              </summary>
              <Text
                variant="body-sm"
                tone="secondary"
                className="border-t-sm border-border-disabled px-4 py-3 md:text-body-md"
              >
                {item.answer}
              </Text>
            </details>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
