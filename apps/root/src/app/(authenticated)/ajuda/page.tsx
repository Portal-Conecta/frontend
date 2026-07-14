import type { Metadata } from 'next'

import { AppShell } from '@portal/core'
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
    answer: 'Os comunicados podem ser vistos pelo menu lateral, em "Comunicados", ou pelo seu e-mail corporativo.',
  },
  {
    question: 'Onde encontro meu mapa de sala?',
    answer: 'A localização da sua sala fica disponível na seção "Mapa de Sala" do menu principal.',
  },
  {
    question: 'Como solicito um novo crachá?',
    answer:
      'Abra um ticket em "RH/Facilidades" ou entre em contato diretamente com o setor administrativo para solicitar a emissão de um novo crachá.',
  },
]

export default function AjudaPage() {
  return (
 
    <AppShell>
      <Text as="h1" 
          variant="heading-h2" 
          className="text-text-brand px-6 pt-2 text-xl md:text-2xl lg:text-3xl">
          Central de Ajuda
      </Text>
      
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 py-22">
        <div className="flex flex-col items-center text-center">
          <div className="text-center lg:text-left">
        <Text 
          as="h1" 
          variant="label-xl-emphasis" 
          className="text-text-brand text-xl md:text-2xl lg:text-3xl">
          Perguntas Frequentes
        </Text>
      </div>
          <Text variant="body-md" 
          className="text-text-secondary max-w-2xl text-center text-body-sm md:text-base lg:text-lg">
            Encontre respostas rápidas para suas dúvidas ou explore nossos tópicos de suporte.
          </Text>
        </div>

        <div className="flex w-full flex-col gap-3 md:max-w-2xl md:mx-auto lg:max-w-full">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="text-text-secondary group rounded-md border-sm border-border-disabled open:text-text-brand open:border-interactive-disabled"
            >
              <summary className="flex w-full cursor-pointer list-none items-center justify-between px-6 py-3 md:p-4 lg:p-5 text-sm md:text-base lg:text-lg">
                {item.question}
                <Icon
                  name="chevron-down"
                  size="md" 
                  className="text-text-secondary transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="border-t-sm border-border-disabled px-4 py-3 text-label-sm md:text-base lg:text-lg text-text-secondary">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </AppShell>
  )
}