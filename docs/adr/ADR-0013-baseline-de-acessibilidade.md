# ADR-0013: Baseline de Acessibilidade

## Status
Aceita

## Data
2026-06-26

## Contexto

A convenção de [acessibilidade](../conventions/acessibilidade.md) reúne as práticas já adotadas no DS (foco visível por token, foco preso em overlay, semântica antes de `role`, contraste pela camada de token, respeito a `prefers-reduced-motion`) e o CI já roda o axe sobre cada story via `@storybook/test-runner`. Faltava, porém, fixar **dois pontos formais** que estavam como "a definir":

- **Qual o nível-alvo de conformidade.** Sem um alvo declarado, "acessível" vira julgamento caso a caso e a régua muda por revisor.
- **Se a verificação bloqueia ou avisa.** O DS carrega dívida de a11y pré-existente. Tornar o gate bloqueante agora pararia todo merge por violações herdadas, transformando o squad de plataforma em gargalo — o oposto da estrela-guia. Mas remover a checagem deixaria a regressão passar despercebida.

Estes dois pontos são uma decisão de direção, não de implementação, e por isso entram como ADR.

## Decisão

**Nível-alvo: WCAG 2.1 AA.** É a régua de conformidade que o Portal Conecta persegue como baseline. Serve de norte para design, autoria de componentes e revisão; alinha-se ao conjunto de regras padrão do axe que já roda no CI.

**A verificação de a11y é consultiva (avisa), não bloqueante — por ora.** O gate roda em cada PR e reporta as violações, mas **não barra o merge** enquanto a dívida de a11y pré-existente no DS não for tratada. Concretamente, o job `a11y` da CI roda com `continue-on-error: true` (rollout #104). A classificação de severidade do axe (`critical`/`serious` vs. `moderate`/`minor`) é mantida para **priorizar** o que tratar primeiro, não para bloquear.

**Caminho para tornar bloqueante.** Quando a dívida pré-existente de `critical`/`serious` for zerada, remove-se o `continue-on-error` e o gate passa a bloquear apenas essas severidades — `moderate`/`minor` seguem como aviso. Essa promoção é uma mudança de governança (ver [ADR-0010](ADR-0010-governanca-ci-como-portao.md)), não um novo ADR.

Esta ADR fixa o alvo e a postura do gate. As práticas concretas (foco, ARIA, contraste, movimento, verificação) seguem documentadas e mantidas na convenção de [acessibilidade](../conventions/acessibilidade.md).

## Consequências

**Positivo:**
- Existe um alvo formal (WCAG 2.1 AA) que ancora design, código e revisão numa régua única.
- A regressão de a11y fica visível em todo PR sem travar o fluxo por dívida herdada — o squad não vira gargalo.
- A severidade do axe ganha um propósito claro: fila de prioridade da dívida, com critério explícito de quando o gate aperta.

**Negativo:**
- Enquanto for consultivo, o gate depende de disciplina humana para não acumular nova dívida — um aviso ignorado não para o merge.
- "AA como baseline" exige auditar componentes existentes para medir a distância até o alvo; o número da dívida ainda não está fechado.
- A promoção a bloqueante depende de alguém zerar a dívida `critical`/`serious`; sem dono, o gate pode ficar consultivo indefinidamente.

## Referências

- [Convenção: Acessibilidade](../conventions/acessibilidade.md)
- [ADR-0010: Governança e CI como Portão](ADR-0010-governanca-ci-como-portao.md)
- Issue #104: Rollout warn-only do gate de a11y
- [WCAG 2.1](https://www.w3.org/TR/WCAG21/) · `.github/workflows/ci.yml` (job `a11y`) · `.storybook/test-runner.ts`
