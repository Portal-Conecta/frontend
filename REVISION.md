# REVISION.md — Rubric de Revisão de PR

Documento autocontido para quem (ou o que) revisa um Pull Request neste repositório: um agente em chat, um agente com acesso ao repo, ou uma **routine automatizada** rodando sem supervisão a cada PR aberto. Este arquivo é o destino: aponte a routine para ele diretamente, sem depender de outro documento para o rubric funcionar.

O revisor **revisa contra os padrões abaixo — ele não aprova o PR**. Aprovação final é sempre humana (ver [CONTRIBUTING.md](CONTRIBUTING.md)). Nada aqui autoriza merge automático.

---

## 1. Se houver acesso ao repositório, leia primeiro (nesta ordem)

Sem acesso ao repo, pule para a Seção 2 — o rubric ali é inline e autossuficiente.

1. [AGENTS.md](AGENTS.md) — mapa de camadas e os três portões de aprovação humana.
2. `packages/[domínio]/AGENTS.md` do domínio que o PR toca, se aplicável.
3. **A issue referenciada no PR** (`Closes #N`) — revise contra o "Pronto quando" dela, não contra gosto pessoal.
4. Convenção/ADR da área tocada, se o achado exigir profundidade: [tokens](docs/conventions/tokens-e-theming.md), [code-style](docs/conventions/code-style.md), [acessibilidade](docs/conventions/acessibilidade.md), [criação de componentes](docs/conventions/creating-components.md), [ADR-0004 camadas](docs/adr/ADR-0004-arquitetura-em-camadas.md).

## 2. Taxonomia de três níveis

Todo achado se classifica em exatamente um destes níveis. Não existe meio-termo.

| Nível | Significado | Ação da routine |
|---|---|---|
| 🔴 **Bloqueante** | Quebra uma regra mecânica ou um portão de CI. | Reporta como bloqueante. PR não deveria mergear até corrigir. |
| 🟡 **Sinaliza para humano** | Toca um portão de governança (não é sobre certo/errado, é sobre quem decide). | Reporta e **marca explicitamente que exige aprovação humana**. A routine **nunca aprova, nunca marca como resolvido, nunca trata como não-bloqueante** — mesmo que o diff pareça trivial. Tamanho do diff é irrelevante aqui; o que importa é *qual arquivo* mudou. |
| 🔵 **Sugestão** | Melhoria de qualidade, simplificação, eficiência — não impede merge. | Reporta como sugestão, sem bloquear. |

## 3. Checklist bloqueante (🔴)

- **Fronteiras de camada.** Import só de cima para baixo (`shared → ui → core → domínio → apps/root`). Um domínio importando outro domínio (`@portal/checklist` ↔ `@portal/comunicados` ↔ `@portal/mapa-salas`) é proibido — o ESLint já quebra o CI para isso, mas confirme que não foi contornado (ex.: import por caminho relativo profundo em vez do pacote). Lógica cross-domain pertence a `@portal/core` (infraestrutura) ou `@portal/shared` (utilitário puro).
- **Token hardcoded.** Hex cru (`bg-[#01258F]`), tamanho arbitrário (`text-[14px]`, `w-[280px]`) ou valor fora da escala quando já existe token semântico equivalente. Exceção só com comentário explicando o motivo + aprovação prévia (ver armadilha da escala esparsa na Seção 5).
- **`'use client'` indevido.** Server Component é o padrão. Só é válido quando o arquivo usa `useState`/`useEffect`/`useRef` ou define event handler diretamente. `'use client'` "por precaução" é apontamento.
- **Definition of Done não cumprida** (ver [definition-of-done.md](docs/ai/definition-of-done.md)):
  - `pnpm lint` (inclui enforcement de token e domain-import) falha.
  - `pnpm typecheck` falha.
  - `pnpm test` falha (lógica nova em `core`/`shared`/scripts sem teste).
  - `pnpm build` falha.
  - Componente novo em `packages/ui` (atom/molecule/organism) sem story — `pnpm check:stories` reprova.
- **Higiene de PR/commit:** commits fora do Conventional Commits ([CONTRIBUTING.md](CONTRIBUTING.md)); branch fora do padrão GitFlow (`feature/` nascendo/morrendo em `develop`); escopo do PR não bate com a issue (mudança não relacionada "de carona").

## 4. Sinaliza sempre para humano — nunca aprova sozinho (🟡)

Estes três já são bloqueantes de governança, não de qualidade — a routine **relata e marca para revisão humana obrigatória**, mesmo diante de um diff de uma linha:

- Qualquer mudança em `packages/ui/` (design system) — exige ≥1 aprovação do squad de Front-End.
- Nova dependência externa (`pnpm add`) — exige alinhamento prévio com o Tech Lead de Front-End.
- Qualquer exceção às fronteiras de camada ou de token (mesmo comentada e "justificada" no PR).

## 5. Armadilhas específicas deste projeto

Pontos onde "parece certo", passa em CI, ou um revisor genérico erraria — é aqui que este rubric difere de uma revisão de código genérica.

- **Escala de espaçamento esparsa e não-contígua.** A fonte de verdade é `packages/ui/src/tokens/spacing.ts` (hoje: `1,2,3,4,6,7,8,10,14,18,20,24,30` — confira o arquivo, não confie em uma lista fixa aqui, ela muda a cada sync do Figma). Qualquer chave do Tailwind fora dessas — `mt-11`, `mt-16`, `mt-9` — **não é sintaxe arbitrária** (`[...]`) e por isso **não é pega** pelo lint de enforcement de token (ADR-0009 / `.eslintrc.base.js`), cujo regex mira só valores em colchete (`-\[`). A classe cola normal, o Tailwind resolve pelo seu próprio default, e o resultado fica fora da escala do DS sem erro em lugar nenhum. Para qualquer classe de espaçamento numérica, confira a chave contra `spacing.ts` antes de aceitar — "o lint passou" não prova nada aqui.
- **Exceção de token é por categoria, não geral.** Radius arbitrário (ex. `rounded-[20px]`) é *temporariamente* tolerado (dívida técnica documentada, sem token de 20px ainda) — mas hex de cor, tamanho de fonte arbitrário e a maioria dos valores de spacing **não** têm essa tolerância. Não aplique a mesma régua para as duas situações.
- **Gate de a11y é consultivo, não bloqueante.** `pnpm test:a11y` roda em CI com `continue-on-error: true` (ver [ADR-0013](docs/adr/ADR-0013-baseline-de-acessibilidade.md)). CI verde **não significa a11y limpa**. Se o PR mexe em algo interativo (foco, overlay, formulário), verifique o resultado do job `a11y` mesmo que ele não tenha barrado o merge — violações `critical`/`serious` são apontamento nesta revisão, ainda que a CI deixe passar.
- **RBAC é UX no front, o gate real é o backend.** `CurrentUser.permissions`/`can()` (ver [ADR-0014](docs/adr/ADR-0014-contrato-rbac.md)) controlam o que é *mostrado* (nav, botões) — não são autorização. Se um PR esconde uma ação atrás de uma permissão mas não há como confirmar um 403 real do backend para essa rota, isso é uma lacuna de segurança real, não cosmética. Não aceite "escondi o botão" como suficiente para uma feature sensível.
- **Nem todo domínio já usa o mesmo padrão de página/rota.** Hoje só `@portal/comunicados` tem o piloto fechado (`PageAnnouncements` + `AppShell` de `@portal/core`, que resolve roteamento Next + RBAC em cima do `AppLayout` do ADR-0012). `@portal/checklist` e `@portal/mapa-salas` ainda são scaffolding (`src/pages/` vazio) — não assuma que a integração de rota já existe lá, e trate `@portal/comunicados` como a referência a espelhar quando esses domínios ganharem página real.
- **Categorias do Storybook são um vocabulário fechado e vivo** ([ADR-0011](docs/adr/ADR-0011-storybook-navegacao-funcional.md) + adendos). O `title:` de uma story nova segue a categoria funcional atual (`Componentes/Ações`, `Inputs`, `Formulário`, `Feedback`, `Overlay`, `Navegação`, `Conteúdo`, `Data`, `Layout`), não a pasta atômica (`atoms`/`molecules`/`organisms`). Confira o ADR e seus adendos mais recentes antes de aprovar uma categoria nova ou incomum.

## 6. Contrato de output

Reporte achados ranqueados do mais para o menos severo. Cada achado:

- **Local:** `arquivo:linha`.
- **Severidade:** 🔴 bloqueante / 🟡 sinaliza-humano / 🔵 sugestão (Seção 2).
- **Categoria:** curta, kebab-case (ex. `layer-boundary`, `token-hardcode`, `use-client-desnecessario`, `dod-gate`, `governance-flag`, `a11y`, `simplification`).
- **Resumo:** uma frase objetiva do problema.
- **Cenário de falha ou correção concreta:** o que quebra na prática, ou — para token/camada — o token semântico certo / para onde a lógica deveria ir.

Seja específico e enxuto: o objetivo é tirar a revisão mecânica do humano, não gerar ruído. Achados 🟡 sempre incluem, no resumo, a frase "exige aprovação humana — não aprovar automaticamente".

---

## Relação com outros documentos

Este arquivo substitui o conteúdo de rubric que antes vivia em [docs/ai/code-review.md](docs/ai/code-review.md) (mantido como ponteiro curto). Para contexto mais amplo — stack, DoD detalhado, quando usar chat vs. agente — ver [docs/ai/](docs/ai/). Para o "porquê" de cada regra, ver os [ADRs](docs/adr/README.md) linkados acima.
