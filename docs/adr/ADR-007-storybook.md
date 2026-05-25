# ADR-007: Storybook para Documentação de Componentes

## Status
Aceita

## Contexto

O `@portal/ui` cresce conforme novos componentes são adicionados. Sem uma ferramenta dedicada, desenvolvedores precisam navegar pelo código-fonte ou rodar o app completo para visualizar e testar um componente isolado. Isso cria fricção no desenvolvimento de UI e dificulta a comunicação com design.

Alternativas consideradas:
- **Documentação manual em Markdown**: baixo custo de setup, mas não renderiza componentes e desatualiza com facilidade.
- **Chromatic sem Storybook**: focado em visual regression testing, mas depende do Storybook de qualquer forma.
- **Ladle**: alternativa mais leve ao Storybook, mas com ecossistema menor e menos plugins.

## Decisão

Adotamos o **Storybook 8** com `@storybook/nextjs` como ambiente de desenvolvimento e documentação do `@portal/ui`.

Configuração em `.storybook/`:
- **Histórias** em `packages/ui/src/**/*.stories.@(ts|tsx)` — co-localizadas com os componentes.
- **Framework**: `@storybook/nextjs` — garante que componentes Next.js (Server Components, Image, Link) funcionem corretamente nas histórias.
- **Aliases**: o Webpack do Storybook resolve os aliases `@portal/*` via mapeamento explícito em `webpackFinal` no `.storybook/main.ts` — mesma experiência de importação do projeto.

```
pnpm storybook        → inicia em localhost:6006
pnpm build-storybook  → gera build estático para deploy
```

## Consequências

**Positivo:**
- Cada componente pode ser desenvolvido, inspecionado e documentado em isolamento — sem precisar de dados reais ou rodar o app completo.
- Storybook serve como contrato visual entre design e desenvolvimento: designers podem revisar componentes antes da integração.
- Histórias funcionam como testes de regressão visual quando integrados com Chromatic.
- A separação por Atomic Design (atoms → molecules → organisms) se reflete naturalmente na organização do Storybook.

**Negativo:**
- Histórias precisam ser mantidas junto com os componentes — mudanças de interface podem quebrar histórias existentes.
- O build do Storybook é separado do build da aplicação — precisa ser incluído explicitamente no pipeline de deploy de documentação.
- Componentes com dependências pesadas de contexto (autenticação, roteamento) requerem decorators adicionais nas histórias.
