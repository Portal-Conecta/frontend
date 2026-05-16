# Guia de Contribuição - Portal Conecta

Este documento define as regras de versionamento e contribuição que todos os membros devem seguir, independente do squad. O nosso repositório utiliza o padrão GitFlow estrito.

Em caso de dúvida, consulte a Scrum Master antes de realizar qualquer ação destrutiva.

---

## Regras de Ouro

- **NUNCA** faça commit direto nas branches `main` ou `develop`;
- Todo código entra exclusivamente via **Pull Request (PR)**;
- PRs precisam de pelo menos **1 aprovação** (Code Review) antes do merge;
- Todo PR que faça merge na `main` ou `develop` precisa obrigatoriamente passar pelo Code Review de um Tech Lead e pelo Squad de Front-End/Design para validação de consistência;
- Todo merge realizado na branch `main` (seja de release ou hotfix) deve **obrigatoriamente** receber uma **Tag de versão** (ex: `v1.0.0`, `v1.0.1`) seguindo o padrão `SemVer`.

---

## Git Flow - Estrutura das Branches

Nossas branches têm propósitos e caminhos rigorosos:

```text
main        -> código estável, produção. Intocável diretamente (Sempre tageado).
dev         -> integração contínua, base de onde nascem as novas features.
feature/    -> desenvolvimento de funcionalidades isoladas.
release/    -> preparação, testes e polimento para a entrega final da sprint.
hotfix/     -> apaga-incêndio. Correções críticas diretamente em produção.
```

### Caminhos Oficiais (Os Fluxos)

**1. O Dia a Dia (Construindo o sistema):**
`develop` -> cria a `feature/sua-branch` -> finaliza -> abre PR -> faz merge de volta na `dev`

**2. Fim de Sprint (Entregando a versão):**
`develop` -> cria a `release/sprint-01` -> homologação/testes -> faz merge na `main` (com Tag, ex: v1.0.0) **E** faz merge de volta na `dev`

**3. Emergência (Bug crítico no ar):**
`main` -> cria a `hotfix/bug-login` -> resolve -> faz merge na `main` (com Tag, ex: v1.0.1) **E** faz merge de volta na `dev`

---

## Nomenclatura de Branches

Use o padrão abaixo, sempre em letras minúsculas separadas por hífen, referenciando o ID da tarefa (se houver):

**Formato:** `tipo/codigo-descricao-curta`

| Tipo | Onde Nasce | Onde Morre | Exemplo de Nome |
| --- | --- | --- | --- |
| **feature/** | `develop` | `develop` | `feature/42-autenticacao-email` |
| **release/** | `develop` | `main` & `develop` | `release/sprint-01` ou `release/v1.0` |
| **hotfix/** | `main` | `main` & `develop` | `hotfix/55-corrige-queda-servidor` |

---

## Padrão de Commits

O histórico do nosso projeto deve ser claro. Usamos o padrão **Conventional Commits**:

```text
tipo: descrição curta, em português e no imperativo
```

### Tipos permitidos
| Tipo | Quando usar | Exemplo |
| --- | --- | --- |
| **feat** | Nova funcionalidade | `feat: adiciona filtro de turmas` |
| **fix** | Correção de bug | `fix: corrige bloqueio de login` |
| **docs** | Documentação | `docs: atualiza README de setup` |
| **refactor** | Refatoração (sem mudar lógica) | `refactor: extrai service de roles` |
| **style** | Formatação (espaços, vírgulas) | `style: alinha tabela de usuários` |
| **test** | Criação ou ajuste de testes | `test: adiciona teste do auth` |
| **chore** | Dependências, build, config | `chore: atualiza pacote axios` |

**Incorreto (Não usem):** `ajustes`, `corrigindo bug`, `wip`, `commit final`.

---

## Como Abrir um Pull Request (PR)

1. Certifique-se que sua branch está atualizada com a `dev` (resolva conflitos localmente).
2. O Título do PR deve seguir o padrão do commit (Ex: `feat: adiciona mapa de salas`).
3. Aplique as **Labels** corretas.
4. Solicite revisão (Reviewers) do Tech Lead do seu squad e do Squad de Front-End/Design.
5. Copie e cole o template abaixo na descrição do PR e preencha:

### Template de Descrição do PR
```markdown
## Contexto

[Descreva em 2-6 linhas a origem dessas contribuições, focando no problema inicial que fora embasado.]

## O que muda

[Descreva o que esse PR faz. Foco no resultado, não no processo. Imagine que quem lê não acompanhou seu trabalho.]

## Issue relacionada

Closes #[número]

## Como testar

[Passos pra revisor validar localmente. Se for visual, anexe screenshot/gif. Se for componente, link do Storybook.]

1. ...
2. ...

## Tipo de mudança

- [ ] Nova feature
- [ ] Correção de bug
- [ ] Refatoração (sem mudança de comportamento)
- [ ] Documentação
- [ ] Infraestrutura / config / build
- [ ] Outro: ___

## Checklist do autor

- [ ] Código segue convenções definidas em CONTRIBUTING.md
- [ ] Build local passa (`npm run build`)
- [ ] Lint passa (`npm run lint`)
- [ ] TypeScript sem erros (`npm run type-check`)
- [ ] Testei manualmente os cenários principais
- [ ] Componentes novos/alterados documentados no Storybook (se aplicável)
- [ ] Documentação atualizada (se aplicável)
- [ ] Não introduzi dependências novas sem alinhamento prévio

## Screenshots / Vídeos

[Cole aqui quando for mudança visual. Apague essa seção se não for aplicável.]

## Notas pro revisor

[Opcional. Algum trecho que merece atenção especial, decisão que tomou que pode gerar dúvida, ou pendência conhecida.]
```

---

## Checklist do Desenvolvedor (Antes de solicitar Review)

- [ ] Minha branch está atualizada com a `develop` mais recente.
- [ ] O código compila localmente sem erros e sem alertas no terminal.
- [ ] O projeto roda perfeitamente (não quebrei a aplicação).
- [ ] Não subi arquivos sensíveis ou inúteis (`.env`, `node_modules`, pastas de build).
- [ ] Meus commits seguem o Conventional Commits.
- [ ] A issue correspondente no board foi movida para "In Review".

---

## Labels Padrão

Sempre aplique as labels corretas para a Scrum Master organizar o board:

| Label | Significado |
| --- | --- |
| `priority: high` | Prioridade máxima para a sprint atual. |
| `priority: medium` | Prioridade média. |
| `priority: low` | Pode ficar para o fim da fila. |
| `bug` | Algo não está funcionando no sistema. |
| `enhancement` | Nova funcionalidade ou melhoria. |
| `blocked` | Issue travada por dependência de outra pessoa/API. |
| `squad: *` | Identifica de qual squad é a responsabilidade. |

---

## Dúvidas?

Tech Lead Front-End: Pablo Tzeliks
Scrum Master 78: Victória
Scrum Master 77: Melissa

No caso de dúvidas, não arrisquem o histórico do Git. Sintam-se à vontade para perguntar!
