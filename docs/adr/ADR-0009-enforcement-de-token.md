# ADR-0009: Enforcement de Token via Lint/CI

## Status
Aceita

## Data
2026-06-22

## Contexto

A política de token do Design System (cor, tipografia e espaçamento sempre via token; valores arbitrários só para medida de layout) está documentada em [tokens-e-theming](../conventions/tokens-e-theming.md), mas hoje é convenção humana: o ESLint do repositório cobre apenas import e variáveis não usadas. Sem enforcement mecânico, a violação mais comum em geração assistida por IA (hex cru, `text-[14px]`, espaçamento fora da escala) passa despercebida e a revisão humana vira o portão.

A estrela-guia do squad é não ser gargalo. Enquanto a disciplina de token depender de revisor humano, o Tech Lead vira o lint de cada PR.

## Decisão

O CI passa a enforçar mecanicamente a política de token já documentada:

- Bloqueia valores arbitrários do Tailwind para cor, tipografia e espaçamento que já têm token (ex.: `bg-[#hex]`, `text-[14px]`, `mt-[44px]`).
- Permite valores arbitrários apenas para medidas de layout sem token (largura, percentual, offset), conforme a convenção.
- Mantém uma allowlist comentada para exceções legítimas e documentadas (ex.: o gradiente primitivo do AuthLayout).

A regra concreta (configuração ESLint) é implementação da issue de CI #102, não desta ADR. Esta ADR fixa a decisão de que a política passa de convenção a enforcement de máquina.

## Consequências

**Positivo:**
- A revisão humana deixa de gastar esforço caçando token hardcoded; o CI reprova antes.
- Squads e agentes recebem feedback imediato e objetivo, sem depender do Tech Lead.
- A política deixa de ser apenas texto e ganha um portão verificável.

**Negativo:**
- Falsos positivos exigem manutenção da allowlist e comentários de exceção.
- A regra precisa cobrir os casos reais sem barrar medida de layout legítima; há calibragem inicial.

## Referências

- [tokens-e-theming](../conventions/tokens-e-theming.md)
- Issue #102: Regra de lint de token no CI
