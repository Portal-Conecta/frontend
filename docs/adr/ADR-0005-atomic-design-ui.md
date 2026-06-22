# ADR-0005: Atomic Design para o Pacote UI

## Status
Aceita

## Data
2026-05-25

## Contexto

O `@portal/ui` precisa de um sistema de organização que escale conforme novos componentes são adicionados e que torne explícito o nível de composição de cada peça. Sem uma convenção, componentes tendem a ficar em pastas arbitrárias (`components/`, `common/`, `shared/`) sem indicar se são primitivos reutilizáveis ou blocos de UI específicos de uma tela.

Alternativas consideradas:
- **Organização por funcionalidade** (`button/`, `form/`, `card/`): intuitivo, mas sem hierarquia clara de composição.
- **Feature-first** (componentes co-localizados com o domínio): dificulta reuso entre domínios distintos.
- **Compound components sem estrutura de pastas**: flexível, mas sem convenção de nomenclatura.

## Decisão

Adotamos o **Atomic Design** como sistema de organização do `@portal/ui`, estruturado em três níveis:

```
packages/ui/src/
├── atoms/        → elementos indivisíveis (Button, Input, Text, Icon)
├── molecules/    → combinações simples de atoms (InputField, SearchBar)
├── organisms/    → blocos complexos de UI (Header, DataTable, Modal)
└── tokens/
    ├── colors.ts
    ├── typography.ts
    └── spacing.ts
```

**Regras:**
- `atoms` não importam de `molecules` ou `organisms`.
- `molecules` compõem apenas `atoms`.
- `organisms` podem compor `atoms` e `molecules`, mas não importam de pacotes de domínio.
- Design tokens (`tokens/`) são importados pelo Tailwind config e pelos componentes, nunca hardcoded.

## Consequências

**Positivo:**
- A localização de um componente comunicar seu nível de abstração — sem ambiguidade sobre onde colocar algo novo.
- Tokens centralizados garantem consistência visual: mudar a cor primária reflete em todo o sistema.
- Facilita a documentação no Storybook: histórias são organizadas pelos mesmos três níveis.
- Componentes `atoms` e `molecules` são altamente testáveis de forma isolada.

**Negativo:**
- A linha entre `molecule` e `organism` pode ser subjetiva — exige alinhamento do time sobre o critério de classificação.
- Componentes muito específicos de um domínio podem tentar "vazar" para `@portal/ui` quando deveriam estar no próprio pacote de domínio.
