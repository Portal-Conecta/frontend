import type { Metadata } from 'next'

import { AppShell } from '@portal/core'
import { Text } from '@portal/ui'
import { getCurrentUser } from '@portal/core/auth/getCurrentUser'

export const metadata: Metadata = {
  title: 'Política de Privacidade | Portal Conecta',
}

export default async function PrivacidadePage() {
     const user = await getCurrentUser()

  return (
    <AppShell user={user} activeKey="">
      <Text
        as="h1"
        variant="heading-h2"
        className="text-text-brand px-6 pt-2 text-xl md:text-2xl lg:text-3xl"
      >
        Política de Privacidade
      </Text>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-16 pl-10 xl:pl-24 pr-6 py-22 items-start w-full">
        
        <div className="text-text-secondary w-full max-w-[320px] md:w-[280px] lg:w-[300px] shrink-0 flex flex-col gap-6 md:sticky md:top-6 bg-bg-secondary/5 p-6 rounded-md border-sm border-border-disabled">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-text-secondary uppercase">
              Nesta Página
            </span>
            <ol className="mt-4 flex flex-col gap-4 text-xs md:text-sm lg:text-base text-text-secondary">
              <li>
                <a href="#dados-coletados" className="hover:text-text-brand hover:underline transition-all">
                  1. Dados coletados e finalidade
                </a>
              </li>
              <li>
                <a href="#compartilhamento" className="hover:text-text-brand hover:underline transition-all">
                  2. Compartilhamento de Dados
                </a>
              </li>
              <li>
                <a href="#seguranca" className="hover:text-text-brand hover:underline transition-all">
                  3. Segurança e Retenção
                </a>
              </li>
              <li>
                <a href="#direitos" className="hover:text-text-brand hover:underline transition-all">
                  4. Seus Direitos (Art. 18 da LGPD)
                </a>
              </li>
              <li>
                <a href="#contato" className="hover:text-text-brand hover:underline transition-all">
                  5. Contato e Alterações
                </a>
              </li>
            </ol>
          </div>

          <div className="border-t-sm border-border-disabled pt-5">
            <span className="text-[10px] font-bold tracking-wider text-text-secondary uppercase">
              Última Atualização
            </span>
            <p className="mt-2 text-xs md:text-sm lg:text-base font-semibold text-text-brand">
              07 de Julho de 2026
            </p>
          </div>
        </div>

        <div className="flex-1 max-w-6xl flex flex-col gap-10 text-text-secondary">
          
          <div className="flex flex-col gap-3">
            <Text
              as="h2"
              variant="label-xl-emphasis"
              className="text-text-brand text-xl md:text-2xl lg:text-3xl"
            >
              POLÍTICA DE PRIVACIDADE – PORTAL CONECTA
            </Text>
            <Text variant="body-md" className="text-text-secondary text-body-sm md:text-base lg:text-lg">
              O Portal Conecta ("Plataforma") coleta e trata dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018). Ao utilizar a Plataforma, você concorda com as práticas abaixo.
            </Text>
          </div>

          <div id="dados-coletados" className="flex flex-col gap-3 scroll-mt-24">
            <Text as="h3" variant="label-xl-emphasis" className="text-text-brand text-lg md:text-xl lg:text-2xl">
              1. Dados Coletados e Finalidade
            </Text>
            <ul className="list-disc pl-5 flex flex-col gap-3 text-body-sm md:text-base lg:text-lg text-text-secondary">
              <li>
                <strong>Dados Cadastrais:</strong> Nome, e-mail, cargo, matrícula e senha criptografada. Finalidade: Permitir o acesso e uso dos módulos de Comunicados, Mapa de Sala e Checklists (Execução de Contrato).
              </li>
              <li>
                <strong>Dados de Uso:</strong> Textos, imagens e reservas inseridos voluntariamente nos módulos. Finalidade: Operação regular das funções do sistema.
              </li>
              <li>
                <strong>Dados Automáticos:</strong> Endereço IP, data, hora de acesso e cookies essenciais. Finalidade: Segurança, melhoria do sistema (Legítimo Interesse) e guarda obrigatória de registros por 6 meses conforme o Marco Civil da Internet (Obrigação Legal).
              </li>
            </ul>
          </div>

          <div id="compartilhamento" className="flex flex-col gap-3 scroll-mt-24">
            <Text as="h3" variant="label-xl-emphasis" className="text-text-brand text-lg md:text-xl lg:text-2xl">
              2. Compartilhamento de Dados
            </Text>
            <Text variant="body-md" className="text-text-secondary text-body-sm md:text-base lg:text-lg">
              Não comercializamos seus dados. O compartilhamento ocorre apenas com:
            </Text>
            <ul className="list-disc pl-5 flex flex-col gap-2 text-body-sm md:text-base lg:text-lg text-text-secondary">
              <li>Provedores de hospedagem em nuvem e banco de dados.</li>
              <li>Serviços integrados de envio de e-mails transacionais (notificações).</li>
              <li>Autoridades públicas, quando exigido por ordem judicial ou lei.</li>
            </ul>
          </div>

          <div id="seguranca" className="flex flex-col gap-3 scroll-mt-24">
            <Text as="h3" variant="label-xl-emphasis" className="text-text-brand text-lg md:text-xl lg:text-2xl">
              3. Segurança e Retenção
            </Text>
            <Text variant="body-md" className="text-text-secondary text-body-sm md:text-base lg:text-lg">
              Os dados são armazenados de forma segura (uso de criptografia HTTPS, hash de senhas e proteção contra vulnerabilidades) pelo tempo necessário para cumprir suas finalidades. O encerramento do vínculo do usuário gera a exclusão ou anonimização dos dados, exceto os históricos de acesso obrigatórios por lei.
            </Text>
          </div>

          <div id="direitos" className="flex flex-col gap-3 scroll-mt-24">
            <Text as="h3" variant="label-xl-emphasis" className="text-text-brand text-lg md:text-xl lg:text-2xl">
              4. Seus Direitos (Art. 18 da LGPD)
            </Text>
            <Text variant="body-md" className="text-text-secondary text-body-sm md:text-base lg:text-lg">
              Você pode solicitar a qualquer momento:
            </Text>
            <ul className="list-disc pl-5 flex flex-col gap-2 text-body-sm md:text-base lg:text-lg text-text-secondary">
              <li>Confirmação e acesso aos seus dados.</li>
              <li>Correção de informações incorretas ou desatualizadas.</li>
              <li>Exclusão, bloqueio ou anonimização de dados desnecessários.</li>
              <li>Revogação de consentimentos anteriores.</li>
            </ul>
          </div>

          <div id="contato" className="flex flex-col gap-3 scroll-mt-24 pb-12">
            <Text as="h3" variant="label-xl-emphasis" className="text-text-brand text-lg md:text-xl lg:text-2xl">
              5. Contato e Alterações
            </Text>
            <Text variant="body-md" className="text-text-secondary text-body-sm md:text-base lg:text-lg">
              Esta política pode ser atualizada devido a novas funcionalidades. Avisaremos sobre mudanças importantes no Módulo de Comunicados. Para dúvidas ou direitos, use o canal oficial de comunicação interna da equipe do projeto.
            </Text>
          </div>

        </div>
      </div>
    </AppShell>
  )
}