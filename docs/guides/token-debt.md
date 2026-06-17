# Guia de Dívida de Token

O que fazer quando o token que você precisa não existe no design system.

→ [Guia completo de tokens](../tokens.md) · [AGENTS.md](../../AGENTS.md)

---

## 1. Literal aceitável × literal proibido

Nem todo valor arbitrário é dívida. A distinção é:

| Tipo de valor | Exemplo | Aceitável? |
|---|---|---|
| Medida de layout sem token (largura de coluna, offset de posição) | `max-w-[480px]`, `left-[3px]` | Sim |
| Cor fora da camada semântica | `bg-[#01258F]` | Não — use o token semântico |
| Tamanho de fonte fora da escala | `text-[14px]` | Não — use `Text` ou classe de token |
| Espaçamento fora da escala do DS | `mt-[44px]`, `mt-11` | Não — snap para o token mais próximo |
| Radius sem token definido | `rounded-[24px]` | Temporariamente sim, com dívida registrada |

---

## 2. Como documentar uma dívida

Quando usar um literal temporário por ausência de token, documente em dois lugares:

**No código — comentário imediatamente acima:**

```tsx
{/* DS não tem token de radius 24px — rounded-3xl até adição de radius.xl */}
<div className="rounded-r-[24px]" />
```

```tsx
{/* tone="overlay" não existe no Button do DS — override até ser definido */}
<Button className="bg-background-surface border-background-surface">
  Entrar
</Button>
```

**Na tabela de dívidas do `AGENTS.md`:**

Abra o arquivo e adicione uma linha na tabela de dívidas técnicas conhecidas:

```markdown
| Descrição curta | `caminho/do/arquivo.tsx` | O que precisa ser feito |
```

---

## 3. Quando promover para token

Um literal temporário deve virar token quando:

- O mesmo valor aparece em **dois ou mais lugares distintos** no código
- O valor representa uma decisão de design (não uma medida de layout pontual)
- O designer confirma que o valor é intencional e recorrente no DS

Se apenas um lugar usa o valor, o literal com comentário é suficiente por ora.

---

## 4. Como propor um novo token

1. **Abra uma issue** descrevendo o valor, onde ele aparece e por que deveria ser token
2. **Alinhe com o Tech Lead** — novos tokens mudam o contrato do DS
3. Se aprovado, o designer atualiza o Figma DS (`fileKey GPvf4G2qpP8MMyK3HB6n2t`)
4. Rode `pnpm sync:tokens` após a exportação do plugin `variables2json` do Figma
5. Revise a normalização em `scripts/sync-tokens.ts` se necessário
6. Adicione ao `tailwind.config.ts` em `theme.extend` se o token pertencer a uma nova categoria
7. Remova o literal temporário e o comentário de dívida
8. Remova a entrada da tabela no `AGENTS.md`

→ [ADR-008 — Pipeline de Tokens](../adr/ADR-008-token-pipeline.md)
