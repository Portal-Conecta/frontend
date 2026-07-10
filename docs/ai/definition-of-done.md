# Definition of Done

Critérios que todo trabalho — humano ou agente — precisa satisfazer antes do merge. O CI é o revisor mecânico: os portões abaixo rodam no pipeline e (salvo o de a11y, ainda consultivo) falham o merge. O grupo [#101](https://github.com/Portal-Conecta/frontend/issues/101) já entregou a automação; resta só tornar o a11y bloqueante.

## Portões ativos no CI

Rodam hoje em todo push de `feature/**` e em PR para `develop`/`main` (ver [ci.yml](../../.github/workflows/ci.yml)). Rode localmente antes de abrir o PR:

| Portão | Comando | O que verifica |
|---|---|---|
| **Lint** | `pnpm lint` | ESLint em todos os pacotes: imports proibidos entre domínios, unused vars, regras base, e enforcement de token (sem hex/tamanho/spacing cru — [ADR-0009](../adr/ADR-0009-enforcement-de-token.md), [#102](https://github.com/Portal-Conecta/frontend/issues/102)). |
| **Story obrigatória** | `pnpm check:stories` | Reprova componente em `atoms`/`molecules`/`organisms` sem story irmã ([#103](https://github.com/Portal-Conecta/frontend/issues/103)). Roda no job de lint. |
| **Typecheck** | `pnpm typecheck` | `tsc --build` no modo estrito/composite — zero erros de tipo. |
| **Testes de lógica** | `pnpm test` | Vitest sobre `core`/`shared`/scripts (auth, sanitização de redirect, etc. — [#105](https://github.com/Portal-Conecta/frontend/issues/105)). |
| **Build** | `pnpm build` | Build do `@portal/root` (e pacotes com build). Falha aqui bloqueia o merge. |
| **Acessibilidade** | `pnpm test:a11y` | axe sobre cada story ([#104](https://github.com/Portal-Conecta/frontend/issues/104)). **Consultivo (warn-only)** por ora — `continue-on-error`, não bloqueia o merge (ver [ADR-0013](../adr/ADR-0013-baseline-de-acessibilidade.md)). |

## Próximo passo de governança (grupo #101)

Os portões mecânicos do grupo #101 (#102 token, #103 story, #104 a11y, #105 testes) já estão **ativos no CI** — ver a tabela acima. Resta uma promoção de governança, não uma automação nova:

| Passo | Issue | O que falta |
|---|---|---|
| **Tornar o gate de a11y bloqueante** | Sem issue aberta ainda | [#104](https://github.com/Portal-Conecta/frontend/issues/104) (fechada) entregou o gate consultivo — não a promoção. Hoje o job `a11y` roda `continue-on-error` (consultivo). Quando a dívida `critical`/`serious` pré-existente for zerada, remove-se o `continue-on-error` e ele passa a bloquear essas severidades (ver [ADR-0013](../adr/ADR-0013-baseline-de-acessibilidade.md)). Abrir issue de rastreio quando a dívida estiver perto de zerar. |

## Checklist antes do PR

- [ ] `pnpm lint` passa (inclui enforcement de token #102 e `check:stories` #103).
- [ ] `pnpm typecheck` passa.
- [ ] `pnpm test` passa.
- [ ] `pnpm build` passa.
- [ ] Componente novo em `packages/ui` tem ao menos uma story no Storybook *(portão #103)*.
- [ ] Sem token hardcoded — exceções comentadas e aprovadas *(portão #102)*.
- [ ] Mudança de a11y conferida no `addon-a11y` do Storybook / `pnpm test:a11y` *(portão #104, consultivo)*.
- [ ] Lógica nova em `core`/`shared`/scripts coberta por teste *(portão #105)*.
- [ ] Commit e PR seguem o [CONTRIBUTING.md](../../CONTRIBUTING.md) (GitFlow, Conventional Commits, referência da issue).

→ Regras de implementação detalhadas em [conventions/](../conventions/). Decisão de governança em [ADR-0010](../adr/ADR-0010-governanca-ci-como-portao.md).
