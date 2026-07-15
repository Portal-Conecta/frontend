import type { Metadata } from 'next'

import { AppShell } from '@portal/core'
import { getCurrentUser } from '@portal/core/auth/getCurrentUser'
import { Text } from '@portal/ui'

export const metadata: Metadata = {
  title: 'Política de Privacidade | Portal Conecta',
}

const sectionLinks = [
  { href: '#dados-coletados', label: '1. Dados coletados e finalidade' },
  { href: '#compartilhamento', label: '2. Compartilhamento de Dados' },
  { href: '#seguranca', label: '3. Segurança e Retenção' },
  { href: '#direitos', label: '4. Seus Direitos (Art. 18 da LGPD)' },
  { href: '#contato', label: '5. Contato e Alterações' },
] as const

export default async function PrivacidadePage() {
  const user = await getCurrentUser()

  return (
    <AppShell user={user} activeKey="">
      <Text
        as="h1"
        variant="heading-h3"
        tone="brand"
        className="px-6 pt-2 md:text-heading-h2"
      >
        Política de Privacidade
      </Text>

      <div className="flex w-full flex-col items-start gap-8 px-6 py-20 md:flex-row md:pl-10 lg:gap-16 xl:pl-24">
        <aside className="flex w-full max-w-xs shrink-0 flex-col gap-6 rounded-md border-sm border-border-disabled bg-background-surface p-6 text-text-secondary md:sticky md:top-6">
          <div>
            <Text
              variant="label-xs"
              tone="secondary"
              className="uppercase tracking-wider"
            >
              Nesta Página
            </Text>
            <ol className="mt-4 flex flex-col gap-4">
              {sectionLinks.map(({ href, label }) => (
                <li key={href}>
                  <Text
                    as="a"
                    href={href}
                    variant="label-sm"
                    tone="secondary"
                    className="transition-colors hover:text-text-brand hover:underline"
                  >
                    {label}
                  </Text>
                </li>
              ))}
            </ol>
          </div>

          <div className="border-t-sm border-border-disabled pt-5">
            <Text
              variant="label-xs"
              tone="secondary"
              className="uppercase tracking-wider"
            >
              Última Atualização
            </Text>
            <Text variant="label-sm-emphasis" tone="brand" className="mt-2">
              07 de Julho de 2026
            </Text>
          </div>
        </aside>

        <div className="flex max-w-6xl flex-1 flex-col gap-10 text-text-secondary">
          <section className="flex flex-col gap-3">
            <Text
              as="h2"
              variant="heading-h3"
              tone="brand"
              className="md:text-heading-h2"
            >
              POLÍTICA DE PRIVACIDADE – PORTAL CONECTA
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              O Portal Conecta (&quot;Plataforma&quot;) coleta e trata dados
              pessoais em conformidade com a Lei Geral de Proteção de Dados
              (LGPD - Lei nº 13.709/2018). Ao utilizar a Plataforma, você
              concorda com as práticas abaixo.
            </Text>
          </section>

          <section
            id="dados-coletados"
            className="flex scroll-mt-24 flex-col gap-3"
          >
            <Text as="h3" variant="heading-h3" tone="brand">
              1. Dados Coletados e Finalidade
            </Text>
            <Text
              as="div"
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              <ul className="flex list-disc flex-col gap-3 pl-5">
                <li>
                  <Text
                    as="span"
                    variant="body-sm-emphasis"
                    tone="secondary"
                    className="md:text-body-md-emphasis"
                  >
                    Dados Cadastrais:
                  </Text>{' '}
                  Nome, e-mail, cargo, matrícula e senha criptografada.
                  Finalidade: permitir o acesso e uso dos módulos de
                  Comunicados, Mapa de Sala e Checklists (Execução de Contrato).
                </li>
                <li>
                  <Text
                    as="span"
                    variant="body-sm-emphasis"
                    tone="secondary"
                    className="md:text-body-md-emphasis"
                  >
                    Dados de Uso:
                  </Text>{' '}
                  Textos, imagens e reservas inseridos voluntariamente nos
                  módulos. Finalidade: operação regular das funções do sistema.
                </li>
                <li>
                  <Text
                    as="span"
                    variant="body-sm-emphasis"
                    tone="secondary"
                    className="md:text-body-md-emphasis"
                  >
                    Dados Automáticos:
                  </Text>{' '}
                  Endereço IP, data, hora de acesso e cookies essenciais.
                  Finalidade: segurança, melhoria do sistema (Legítimo
                  Interesse) e guarda obrigatória de registros por 6 meses
                  conforme o Marco Civil da Internet (Obrigação Legal).
                </li>
              </ul>
            </Text>
          </section>

          <section
            id="compartilhamento"
            className="flex scroll-mt-24 flex-col gap-3"
          >
            <Text as="h3" variant="heading-h3" tone="brand">
              2. Compartilhamento de Dados
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Não comercializamos seus dados. O compartilhamento ocorre apenas
              com:
            </Text>
            <Text
              as="div"
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              <ul className="flex list-disc flex-col gap-2 pl-5">
                <li>Provedores de hospedagem em nuvem e banco de dados.</li>
                <li>
                  Serviços integrados de envio de e-mails transacionais
                  (notificações).
                </li>
                <li>
                  Autoridades públicas, quando exigido por ordem judicial ou
                  lei.
                </li>
              </ul>
            </Text>
          </section>

          <section id="seguranca" className="flex scroll-mt-24 flex-col gap-3">
            <Text as="h3" variant="heading-h3" tone="brand">
              3. Segurança e Retenção
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Os dados são armazenados de forma segura (uso de criptografia
              HTTPS, hash de senhas e proteção contra vulnerabilidades) pelo
              tempo necessário para cumprir suas finalidades. O encerramento do
              vínculo do usuário gera a exclusão ou anonimização dos dados,
              exceto os históricos de acesso obrigatórios por lei.
            </Text>
          </section>

          <section id="direitos" className="flex scroll-mt-24 flex-col gap-3">
            <Text as="h3" variant="heading-h3" tone="brand">
              4. Seus Direitos (Art. 18 da LGPD)
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Você pode solicitar a qualquer momento:
            </Text>
            <Text
              as="div"
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              <ul className="flex list-disc flex-col gap-2 pl-5">
                <li>Confirmação e acesso aos seus dados.</li>
                <li>Correção de informações incorretas ou desatualizadas.</li>
                <li>
                  Exclusão, bloqueio ou anonimização de dados desnecessários.
                </li>
                <li>Revogação de consentimentos anteriores.</li>
              </ul>
            </Text>
          </section>

          <section
            id="contato"
            className="flex scroll-mt-24 flex-col gap-3 pb-12"
          >
            <Text as="h3" variant="heading-h3" tone="brand">
              5. Contato e Alterações
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Esta política pode ser atualizada devido a novas funcionalidades.
              Avisaremos sobre mudanças importantes no Módulo de Comunicados.
              Para dúvidas ou direitos, use o canal oficial de comunicação
              interna da equipe do projeto.
            </Text>
          </section>
        </div>
      </div>
    </AppShell>
  )
}
