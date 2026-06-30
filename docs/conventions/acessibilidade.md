# Convenção: Acessibilidade

**Público:** todos (plataforma e squads operacionais).

> O nível-alvo de conformidade é **WCAG 2.1 AA** e a postura do gate (consultivo, não bloqueante por ora) estão fixados na [ADR-0013 (baseline de acessibilidade)](../adr/ADR-0013-baseline-de-acessibilidade.md). Esta convenção reúne as práticas já adotadas no DS para alcançar esse alvo.

## Foco e teclado

- Todo elemento interativo é alcançável e operável por teclado.
- Foco visível sempre via token (`border-focus` / `ring`), nunca removido sem substituto.
- Componentes em overlay (drawer, modal) prendem o foco e fecham com `Esc`, devolvendo o foco ao gatilho. Referência real: o drawer da `Sidebar` (`packages/ui/src/organisms/Sidebar`).

## ARIA e semântica

- Use o elemento HTML correto antes de recorrer a `role`.
- Campos de formulário associam label e mensagens via `aria-describedby`; o estado de erro reflete em `aria-invalid`. A molecule `Field` padroniza isso quando disponível.
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

Por ora, **o gate é consultivo: roda e reporta, mas não bloqueia o merge** — o job `a11y` da CI usa `continue-on-error: true` enquanto a dívida de a11y pré-existente no DS não é tratada (ver [ADR-0013](../adr/ADR-0013-baseline-de-acessibilidade.md)). A classificação por `impact` serve para **priorizar** o que tratar primeiro:

| Impacto | Como tratar |
|---|---|
| `critical`, `serious` | Prioridade — são o que fará o gate bloquear quando ele apertar. |
| `moderate`, `minor` | Aviso (`console.warn`); seguem como aviso mesmo após o gate virar bloqueante. |

Quando a dívida `critical`/`serious` for zerada, remove-se o `continue-on-error` e o gate passa a **bloquear** essas severidades. Até lá, trate todo aviso como dívida a não acumular.

Uma story pode desativar a checagem com `parameters.a11y.disable` ou ajustar regras via `parameters.a11y.config.rules` — use com parcimônia e justifique.

> O Chromatic também executa a11y sobre as stories; o corte de severidade acima é o contrato do squad para ambos os caminhos.
