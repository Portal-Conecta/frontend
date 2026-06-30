# ADR-0006: Tailwind CSS v4 como Solução de Estilização

## Status
Aceita

## Data
2026-05-25

## Contexto

O projeto precisa de uma estratégia de estilização que funcione bem com React Server Components, seja performática em produção, e se integre com o sistema de design tokens do `@portal/ui`. CSS-in-JS (styled-components, Emotion) tem limitações conhecidas com RSC por depender de runtime no cliente.

Alternativas consideradas:
- **styled-components / Emotion**: API familiar e co-localização de estilos com componentes, mas incompatíveis com Server Components sem configuração adicional e aumentam o bundle JS.
- **CSS Modules**: zero runtime, excelente isolamento, mas sem integração nativa com design tokens e verbose para utilitários.
- **Vanilla Extract**: type-safe, zero runtime, mas adiciona complexidade de build e pouco adotado no mercado brasileiro.

## Decisão

Adotamos o **Tailwind CSS v4** como solução principal de estilização.

A configuração centralizada em `tailwind.config.ts` na raiz do monorepo é consumida por todos os pacotes. Design tokens definidos em `packages/ui/src/tokens/` são referenciados na seção `theme.extend` do Tailwind, garantindo que as classes utilitárias reflitam o sistema de design.

```
tailwind.config.ts (raiz)
  └── theme.extend
        ├── colors     ← packages/ui/src/tokens/colors.ts
        ├── fontFamily ← packages/ui/src/tokens/typography.ts
        └── spacing    ← packages/ui/src/tokens/spacing.ts
```

## Consequências

**Positivo:**
- Zero runtime JavaScript para estilos — compatível nativamente com React Server Components.
- Classes utilitárias aceleram prototipação: sem alternar entre arquivo `.tsx` e `.css`.
- PurgeCSS integrado no build: apenas as classes utilizadas chegam ao bundle de produção.
- Tailwind v4 usa CSS nativo (cascade layers, custom properties) — sem pré-processador adicional.
- Um único `tailwind.config.ts` garante consistência de tokens em todo o monorepo.

**Negativo:**
- HTML/JSX com muitas classes utilitárias pode ficar verboso — exige disciplina para extrair componentes quando necessário.
- Desenvolvedores sem experiência com Tailwind precisam aprender a API de classes antes de contribuir.
- Customizações muito específicas (animações complexas, estilos condicionais aninhados) ainda exigem CSS convencional.
