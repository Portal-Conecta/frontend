## Contexto

No checklist, os botões **Conforme** e **Não Conforme** (`StatusToggle`) e o chip de status do **ChecklistItemResult** ficavam com larguras diferentes por causa do comprimento do texto. Isso quebrava a leitura visual no Storybook e na tela de preenchimento/resultado, principalmente no desktop.

Esta PR padroniza o tamanho dos controles de conformidade com tokens do Design System e fecha o lint do CI.

## O que muda

- **StatusToggle**
  - Os dois botões passam a ter a **mesma caixa** (largura e altura fixas via tokens `spacing`).
  - Texto completo: **Conforme** e **Não Conforme**.
  - Labels centralizados na mesma área útil, independente do tamanho da palavra.
- **ChecklistItemResult**
  - Chip de status com **largura fixa** para os estados conforme e não conforme.
  - Layout alinhado ao DS (padding e tipografia de label).
- **Design System (`@portal/ui`)**
  - Inclusão do token de spacing **`36` (144px)** na escala, para largura de chips/botões de status.
- **CI**
  - Remoção de import não utilizado de `spacing` no `ChecklistItemResult` (eslint `@typescript-eslint/no-unused-vars`).
- **Storybook**
  - Stories de apoio para validar botões/chips com o mesmo tamanho.

## Issue relacionada

Closes #103

## Como testar

1. Checkout da branch e instalação:
   ```bash
   git checkout feature/#103-cria-componente-checklist-item-result
   pnpm install
   ```
2. Storybook:
   ```bash
   pnpm storybook
   ```
3. Validar:
   - **Checklist → Atoms → StatusToggle**
     - Default, Conforme selecionado, Não Conforme selecionado.
     - Confirmar que os dois botões têm a **mesma largura e altura**.
     - Confirmar que os textos **não quebram linha** e aparecem por completo.
   - **Checklist → Molecules → ChecklistItemResult**
     - Stories Conforme, Não Conforme e Lista (se existir).
     - Confirmar chips com largura consistente entre estados.
4. Lint (CI local):
   ```bash
   pnpm --filter @portal/checklist lint
   ```
5. (Opcional) App — se o toggle estiver montado em alguma tela de checklist, validar no browser em desktop e viewport estreito.

## Tipo de mudança

- [x] Nova feature
- [x] Correção de bug
- [ ] Refatoração (sem mudança de comportamento)
- [ ] Documentação
- [ ] Infraestrutura / config / build
- [ ] Outro: ___

> Feature no sentido de evolução visual do componente da issue; inclui correção de tamanho desigual e do lint.

## Checklist do autor

- [x] Código segue convenções definidas em CONTRIBUTING.md
- [x] Validei localmente que a aplicação compila/gera build sem erros (quando aplicável)
- [x] Verifiquei que não há erros de análise estática ou alertas relevantes no código (quando aplicável)
- [x] Confirmei que não há erros de tipagem/TypeScript no escopo da mudança (quando aplicável)
- [x] Testei manualmente os cenários principais
- [x] Componentes novos/alterados documentados no Storybook (se aplicável)
- [ ] Documentação atualizada (se aplicável)
- [x] Não introduzi dependências novas sem alinhamento prévio

## Screenshots / Vídeos

> Anexar no GitHub após abrir o PR:

1. **StatusToggle** — lado a lado Conforme / Não Conforme (mesma caixa).
2. **ChecklistItemResult** — lista com os dois status.
3. (Opcional) Viewport mobile do StatusToggle.

## Notas pro revisor

- O token `spacing[36]` (144px) foi adicionado em `packages/ui/src/tokens/spacing.ts` para uso em botões/chips de status. Vale confirmar se o DS oficial já prevê esse valor no Figma; se o valor alvo for outro (ex.: 136px), ajustamos o token.
- Em `ChecklistItemResult`, a largura fixa no chip usa valor de layout no estilo inline; o `StatusToggle` usa o token `spacing[36]`.
- Branch focada no **#103** (componentes de item/resultado). Mudanças de dashboard (`#410`) ficam fora deste PR.
