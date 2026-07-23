## Contexto

No fluxo de preenchimento do checklist (`/checklist`), depois de escolher a sala o app busca o template ativo e fica em loading. O estado de carregamento era genérico (duas barras no centro), diferente da tela real de preenchimento, o que gerava “salto” visual quando o conteúdo entrava.

Esta PR corrige o **skeleton screen** dessa etapa para espelhar o layout real da `FillChecklistPage`.

## O que muda

- **`FillChecklistSkeleton`** (novo)
  - Header: botão voltar + título da sala + tipo + barra de progresso
  - Select de turma
  - Lista de itens (título/descrição + placeholders dos botões Conforme / Não Conforme)
  - Footer com ação de envio
  - `aria-busy` / `aria-label` para acessibilidade
- **`ChecklistFlow`**
  - No `loadingTemplate` (após selecionar sala), troca o skeleton genérico por `FillChecklistSkeleton`
- Export em `FillChecklistPage/index.ts`

## Issue relacionada

Closes #491

## Como testar

1. Checkout da branch e instalação:

```bash
git checkout style/#491-alteracoes-esteticas-telas-checklist
pnpm install
```

2. Subir o app e entrar em **Checklist** (perfil com permissão de preencher).
3. Na seleção de sala, clicar em uma sala.
4. Validar o loading:
   - Deve aparecer o skeleton no **mesmo formato** da tela de preenchimento (não só duas barras no centro).
   - Ao carregar o template, a transição para o formulário real deve ser suave, sem salto grande de layout.
5. (Opcional) Testar em mobile e desktop.

## Tipo de mudança

- [ ] Nova feature
- [x] Correção de bug / UX
- [ ] Refatoração (sem mudança de comportamento)
- [ ] Documentação
- [ ] Infraestrutura / config / build
- [ ] Outro: ___

## Checklist do autor

- [x] Código segue convenções do projeto
- [x] Validei localmente o fluxo de preenchimento
- [x] Skeleton espelha a estrutura da tela final
- [x] Não introduzi dependências novas
- [ ] Screenshots anexados no GitHub

## Screenshots

> Anexar no GitHub:

1. Skeleton ao abrir o preenchimento (após clicar na sala).
2. Tela real carregada (para comparar o alinhamento).

## Notas pro revisor

- Branch: `style/#491-alteracoes-esteticas-telas-checklist`
- Commit: `#491 style: skeleton da tela de preenchimento espelha o layout real`
- Foco no loading **entre sala e formulário** (`loadingTemplate` no `ChecklistFlow`).
