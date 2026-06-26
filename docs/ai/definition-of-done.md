# Definition of Done

Critérios que todo trabalho — humano ou agente — precisa satisfazer antes do merge. O CI é o revisor mecânico: o que está marcado como **portão ativo** falha o pipeline; o que está marcado como **planejado** ainda é verificado na revisão de PR até a automação entrar (grupo [#101](https://github.com/Portal-Conecta/frontend/issues/101)).

## Portões ativos no CI

Rodam hoje em todo push de `feature/**` e em PR para `develop`/`main` (ver [ci.yml](../../.github/workflows/ci.yml)). Rode localmente antes de abrir o PR:

| Portão | Comando | O que verifica |
|---|---|---|
| **Lint** | `pnpm lint` | ESLint em todos os pacotes: imports proibidos entre domínios, unused vars, regras base. |
| **Typecheck** | `pnpm typecheck` | `tsc --build` no modo estrito/composite — zero erros de tipo. |
| **Build** | `pnpm build` | Build do `@portal/root` (e pacotes com build). Falha aqui bloqueia o merge. |

## Portões planejados (grupo #101)

À medida que cada issue entrega, o item migra para "portão ativo" acima e esta tabela encolhe. Hoje são **expectativas de revisão**, não automação:

| Portão | Issue | O que vai verificar |
|---|---|---|
| **Token sem hardcode** | [#102](https://github.com/Portal-Conecta/frontend/issues/102) | Regra ESLint barrando arbitrary value do Tailwind (`w-[280px]`, `text-[14px]`, `bg-[#hex]`), com allowlist comentada para exceções. |
| **Story obrigatória** | [#103](https://github.com/Portal-Conecta/frontend/issues/103) | Script que falha se um componente em `atoms`/`molecules`/`organisms` não tem story irmã. Integrado ao job de lint. |
| **Acessibilidade** | [#104](https://github.com/Portal-Conecta/frontend/issues/104) | `addon-a11y` + a11y do Chromatic sobre as stories (contraste, atributos aria). Alvo WCAG 2.1 AA; gate consultivo (warn-only) por ora — ver [ADR-0013](../adr/ADR-0013-baseline-de-acessibilidade.md). |
| **Testes de lógica** | [#105](https://github.com/Portal-Conecta/frontend/issues/105) | Vitest + Testing Library: auth/session em `core`, script de sync de tokens, utils de `shared`. Job `test` no CI. |

## Checklist antes do PR

- [ ] `pnpm lint` passa.
- [ ] `pnpm typecheck` passa.
- [ ] `pnpm build` passa.
- [ ] Componente novo em `packages/ui` tem ao menos uma story no Storybook *(será portão #103)*.
- [ ] Sem token hardcoded — exceções comentadas e aprovadas *(será portão #102)*.
- [ ] Mudança de a11y conferida no `addon-a11y` do Storybook *(será portão #104)*.
- [ ] Lógica nova em `core`/`shared`/scripts coberta por teste quando aplicável *(será portão #105)*.
- [ ] Commit e PR seguem o [CONTRIBUTING.md](../../CONTRIBUTING.md) (GitFlow, Conventional Commits, referência da issue).

→ Regras de implementação detalhadas em [conventions/](../conventions/). Decisão de governança em [ADR-0010](../adr/ADR-0010-governanca-ci-como-portao.md).
