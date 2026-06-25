# Convenção: Acessibilidade

**Público:** todos (plataforma e squads operacionais).

> O nível formal de conformidade (alvo WCAG) será fixado em uma ADR de baseline de acessibilidade, ainda a definir. Esta convenção reúne as práticas já adotadas no DS.

## Foco e teclado

- Todo elemento interativo é alcançável e operável por teclado.
- Foco visível sempre via token (`border-focus` / `ring`), nunca removido sem substituto.
- Componentes em overlay (drawer, modal) prendem o foco e fecham com `Esc`, devolvendo o foco ao gatilho. Referência real: o drawer da `Sidebar` (`packages/ui/src/organisms/Sidebar`).

## ARIA e semântica

- Use o elemento HTML correto antes de recorrer a `role`.
- Campos de formulário associam label e mensagens via `aria-describedby`; o estado de erro reflete em `aria-invalid`. A molecule `FormField` padroniza isso quando disponível.
- Regiões dinâmicas (notificações, validação assíncrona) anunciam via `aria-live`.

## Cor e contraste

- Cor vem sempre da camada semântica de tokens (ver [tokens-e-theming](tokens-e-theming.md)); o contraste é responsabilidade do token, não do componente.
- Nunca comunique estado apenas por cor; combine com ícone, texto ou forma.

## Movimento

- Animações respeitam `prefers-reduced-motion` (ex.: o shimmer do `Skeleton` e o colapso da Sidebar).

## Verificação

- O addon de a11y do Storybook valida contraste e atributos aria por componente durante o desenvolvimento. Trate violação como bug, não como aviso.
- No CI, o `@storybook/test-runner` roda o axe em cada story (job `a11y`, ver [ci.yml](../../.github/workflows/ci.yml) e [.storybook/test-runner.ts](../../.storybook/test-runner.ts)).

## Severidade no gate de CI (#104)

O gate classifica as violações do axe pelo campo `impact`:

| Impacto | Efeito no CI |
|---|---|
| `critical`, `serious` | **Bloqueiam** o merge (o job `a11y` falha). |
| `moderate`, `minor` | **Aviso** (`console.warn`), não bloqueiam. |

Uma story pode desativar a checagem com `parameters.a11y.disable` ou ajustar regras via `parameters.a11y.config.rules` — use com parcimônia e justifique.

> O Chromatic também executa a11y sobre as stories; o corte de severidade acima é o contrato do squad para ambos os caminhos.
