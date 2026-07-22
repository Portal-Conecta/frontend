import type { Metadata } from 'next'

import { Text } from '@portal/ui'

export const metadata: Metadata = {
  title: 'Política de Privacidade | Portal Conecta',
}

const sectionLinks = [
  { href: '#dados-coletados', label: '1. Dados coletados e finalidade' },
  { href: '#compartilhamento', label: '2. Compartilhamento de Dados' },
  { href: '#seguranca', label: '3. Segurança e Retenção' },
  { href: '#direitos', label: '4. Direitos do Titular dos Dados' },
  { href: '#contato', label: '5. Contato e Alterações' },
] as const

export default function PrivacidadePage() {
  return (
    <>
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
              O Portal Conecta (&quot;Plataforma&quot;) realiza o tratamento
              de dados pessoais em conformidade com a Lei Geral de Proteção de
              Dados Pessoais (LGPD – Lei nº 13.709/2018), observando também os
              princípios da finalidade, adequação, necessidade, livre acesso,
              qualidade dos dados, transparência, segurança, prevenção, não
              discriminação e responsabilização, previstos no artigo 6º da
              legislação.
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Ao utilizar a Plataforma, o usuário declara estar ciente desta
              Política de Privacidade e concorda com o tratamento de seus dados
              pessoais para as finalidades descritas a seguir, sempre
              respeitando os direitos garantidos pela legislação vigente.
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
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Para possibilitar o correto funcionamento da Plataforma, são
              coletados apenas os dados estritamente necessários para a execução
              de suas funcionalidades, respeitando o princípio da minimização de
              dados previsto na LGPD.
            </Text>
            <Text
              as="div"
              variant="body-sm-emphasis"
              tone="secondary"
              className="md:text-body-md-emphasis"
            >
              Dados Cadastrais
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Durante o processo de cadastro e autenticação são coletados os
              seguintes dados:
            </Text>
            <Text
              as="div"
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              <ul className="flex list-disc flex-col gap-2 pl-5">
                <li>Nome completo;</li>
                <li>Endereço de e-mail corporativo;</li>
                <li>Cargo ou função desempenhada;</li>
                <li>Matrícula funcional;</li>
                <li>
                  Senha de acesso armazenada de forma criptografada (hash).
                </li>
              </ul>
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Essas informações possuem como finalidade identificar unicamente
              cada usuário dentro da plataforma, controlar permissões de acesso,
              garantir a autenticação segura, permitir a utilização dos módulos
              disponíveis (Comunicados, Mapa de Sala e Checklists), registrar
              autoria das ações executadas e manter a integridade das
              informações armazenadas.
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Em nenhum momento a senha do usuário é armazenada em formato
              legível, sendo protegida por algoritmos criptográficos amplamente
              utilizados no mercado.
            </Text>
            <Text
              as="div"
              variant="body-sm-emphasis"
              tone="secondary"
              className="md:text-body-md-emphasis"
            >
              Dados de Uso
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Durante a utilização da Plataforma poderão ser registrados dados
              produzidos voluntariamente pelo próprio usuário, incluindo:
            </Text>
            <Text
              as="div"
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              <ul className="flex list-disc flex-col gap-2 pl-5">
                <li>Comunicados publicados;</li>
                <li>Reservas realizadas;</li>
                <li>Checklists preenchidos;</li>
                <li>Imagens anexadas;</li>
                <li>Comentários e observações;</li>
                <li>Informações relacionadas às atividades executadas.</li>
              </ul>
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Esses dados são utilizados exclusivamente para possibilitar o
              funcionamento das funcionalidades do Portal Conecta, registrar
              histórico das operações realizadas, facilitar auditorias internas,
              garantir rastreabilidade das atividades e apoiar a execução dos
              processos internos da organização.
            </Text>
            <Text
              as="div"
              variant="body-sm-emphasis"
              tone="secondary"
              className="md:text-body-md-emphasis"
            >
              Dados Coletados Automaticamente
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Para garantir a segurança da aplicação e o correto funcionamento
              dos serviços, alguns dados são coletados automaticamente durante o
              acesso, tais como:
            </Text>
            <Text
              as="div"
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              <ul className="flex list-disc flex-col gap-2 pl-5">
                <li>Endereço IP;</li>
                <li>Data e horário de acesso;</li>
                <li>Informações do navegador utilizado;</li>
                <li>Identificação do dispositivo;</li>
                <li>
                  Cookies estritamente necessários para autenticação e
                  funcionamento do sistema;
                </li>
                <li>Registros de login e logout.</li>
              </ul>
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Esses dados possuem como finalidade:
            </Text>
            <Text
              as="div"
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              <ul className="flex list-disc flex-col gap-2 pl-5">
                <li>Prevenir acessos não autorizados;</li>
                <li>Detectar tentativas de fraude ou ataques cibernéticos;</li>
                <li>Manter registros para auditorias de segurança;</li>
                <li>Melhorar continuamente o desempenho da Plataforma;</li>
                <li>
                  Cumprir obrigações legais previstas no Marco Civil da
                  Internet (Lei nº 12.965/2014), especialmente no que se refere
                  à guarda obrigatória dos registros de acesso por período
                  mínimo de seis meses.
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
              O Portal Conecta não comercializa, vende, aluga ou compartilha
              dados pessoais para fins comerciais ou publicitários.
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              O compartilhamento ocorre exclusivamente quando necessário para a
              execução dos serviços disponibilizados pela Plataforma ou para
              cumprimento de obrigações legais.
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Os dados poderão ser compartilhados com:
            </Text>
            <Text
              as="div"
              variant="body-sm-emphasis"
              tone="secondary"
              className="md:text-body-md-emphasis"
            >
              Provedores de Infraestrutura
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Empresas responsáveis pela hospedagem da aplicação, servidores,
              armazenamento em nuvem e bancos de dados, que realizam o
              tratamento das informações apenas para garantir a disponibilidade
              e funcionamento da Plataforma.
            </Text>
            <Text
              as="div"
              variant="body-sm-emphasis"
              tone="secondary"
              className="md:text-body-md-emphasis"
            >
              Serviços Integrados
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Ferramentas utilizadas para envio de e-mails automáticos,
              notificações do sistema, recuperação de senha e comunicação entre
              usuários.
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Esses fornecedores atuam como operadores de dados pessoais e estão
              sujeitos às obrigações previstas na LGPD, devendo adotar medidas
              adequadas de segurança da informação.
            </Text>
            <Text
              as="div"
              variant="body-sm-emphasis"
              tone="secondary"
              className="md:text-body-md-emphasis"
            >
              Autoridades Públicas
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Quando houver determinação judicial, requisição legal ou
              obrigação prevista na legislação brasileira, os dados poderão ser
              compartilhados com autoridades competentes, sempre observando os
              limites legais aplicáveis.
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Nenhum compartilhamento é realizado sem finalidade legítima e
              previamente justificada.
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
              A proteção das informações dos usuários constitui um dos
              principais compromissos do Portal Conecta.
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Para reduzir riscos de acesso não autorizado, perda, alteração,
              divulgação ou destruição indevida dos dados, são adotadas medidas
              técnicas e administrativas compatíveis com as boas práticas de
              segurança da informação, incluindo:
            </Text>
            <Text
              as="div"
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              <ul className="flex list-disc flex-col gap-2 pl-5">
                <li>Comunicação protegida por protocolo HTTPS (TLS);</li>
                <li>Armazenamento seguro das informações em servidores protegidos;</li>
                <li>Utilização de hash criptográfico para senhas;</li>
                <li>Controle de autenticação e autorização de usuários;</li>
                <li>Restrição de acessos conforme níveis de permissão;</li>
                <li>Registros de auditoria (logs);</li>
                <li>Proteção contra vulnerabilidades conhecidas;</li>
                <li>
                  Atualizações periódicas dos componentes utilizados pela
                  Plataforma.
                </li>
              </ul>
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Os dados pessoais permanecerão armazenados somente durante o
              período necessário para cumprir as finalidades para as quais foram
              coletados, respeitando prazos legais, regulatórios e contratuais.
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Após o encerramento do vínculo do usuário com a Plataforma, seus
              dados poderão ser:
            </Text>
            <Text
              as="div"
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              <ul className="flex list-disc flex-col gap-2 pl-5">
                <li>Excluídos definitivamente;</li>
                <li>Anonimizados, tornando impossível sua identificação;</li>
                <li>
                  Mantidos apenas quando houver obrigação legal, regulatória ou
                  necessidade para defesa em processos judiciais ou
                  administrativos.
                </li>
              </ul>
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Os registros obrigatórios previstos no Marco Civil da Internet
              serão preservados pelos prazos determinados pela legislação.
            </Text>
          </section>

          <section id="direitos" className="flex scroll-mt-24 flex-col gap-3">
            <Text as="h3" variant="heading-h3" tone="brand">
              4. Direitos do Titular dos Dados (Art. 18 da LGPD)
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Em conformidade com o artigo 18 da Lei Geral de Proteção de
              Dados, o usuário poderá exercer, a qualquer momento, seus direitos
              em relação aos dados pessoais tratados pela Plataforma.
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Entre esses direitos destacam-se:
            </Text>
            <Text
              as="div"
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              <ul className="flex list-disc flex-col gap-2 pl-5">
                <li>Confirmação da existência de tratamento de dados pessoais;</li>
                <li>Acesso aos dados armazenados;</li>
                <li>
                  Correção de informações incompletas, inexatas ou
                  desatualizadas;
                </li>
                <li>
                  Anonimização, bloqueio ou eliminação de dados desnecessários,
                  excessivos ou tratados em desconformidade com a legislação;
                </li>
                <li>Portabilidade dos dados, quando aplicável;</li>
                <li>
                  Eliminação dos dados tratados mediante consentimento,
                  observadas as hipóteses legais de conservação;
                </li>
                <li>
                  Informação sobre entidades públicas e privadas com as quais
                  houve compartilhamento de dados;
                </li>
                <li>Revogação do consentimento anteriormente concedido;</li>
                <li>
                  Solicitação de revisão de decisões automatizadas, quando
                  aplicável.
                </li>
              </ul>
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Todas as solicitações serão analisadas conforme os procedimentos
              previstos na LGPD e respondidas dentro dos prazos estabelecidos
              pela legislação.
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
              Esta Política de Privacidade poderá ser atualizada sempre que
              houver alterações na legislação aplicável, modificações nas
              funcionalidades do Portal Conecta ou implementação de novos
              recursos que envolvam tratamento de dados pessoais.
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Sempre que ocorrerem mudanças relevantes, os usuários serão
              comunicados por meio do Módulo de Comunicados ou por outros canais
              oficiais da organização.
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              Caso o usuário deseje exercer qualquer direito previsto na LGPD,
              esclarecer dúvidas sobre esta Política de Privacidade ou solicitar
              informações sobre o tratamento de seus dados pessoais, deverá
              entrar em contato por meio do canal oficial disponibilizado pela
              equipe responsável pelo Portal Conecta.
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="md:text-body-md"
            >
              O Portal Conecta compromete-se a atuar de forma transparente,
              segura e responsável, garantindo que todo tratamento de dados
              pessoais seja realizado em conformidade com a Lei Geral de
              Proteção de Dados, com o Marco Civil da Internet e com as melhores
              práticas de segurança da informação adotadas no mercado.
            </Text>
          </section>
        </div>
      </div>
    </>
  )
}
