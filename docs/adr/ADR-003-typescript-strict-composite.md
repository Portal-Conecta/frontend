# ADR-003: TypeScript Estrito com Project References Compostos

## Status
Aceita

## Contexto

Com múltiplos pacotes num monorepo, a configuração do TypeScript precisa lidar com dois desafios: (1) garantir que o código seja seguro o suficiente para um sistema em produção e (2) compilar apenas o que mudou, sem reprocessar o monorepo inteiro a cada `tsc`.

Alternativas consideradas:
- **Um `tsconfig.json` único na raiz**: simples, mas força recompilar tudo em cada verificação de tipo — lento em monorepos grandes.
- **TypeScript sem `strict: true`**: menos fricção no desenvolvimento inicial, mas abre espaço para bugs sutis em runtime (nulos não tratados, tipos implícitos `any`).
- **esbuild / swc apenas para transpilação**: rápido, mas não verifica tipos — deixaria erros de tipo para o CI.

## Decisão

Adotamos **TypeScript com modo estrito completo** (`strict: true`) e **project references compostos** (`composite: true`).

Configuração central em `tsconfig.base.json` com as seguintes flags habilitadas além do `strict`:
- `noUncheckedIndexedAccess` — acesso a índices de array retorna `T | undefined`
- `noImplicitOverride` — sobrescrita de métodos exige `override` explícito
- `exactOptionalPropertyTypes` — diferencia propriedade ausente de propriedade `undefined`

Cada pacote possui seu próprio `tsconfig.json` que estende `tsconfig.base.json` e declara `composite: true`. O `tsconfig.json` raiz lista todas as referências via `references: [...]`, permitindo `tsc --build` incremental.

## Consequências

**Positivo:**
- `tsc --build` recompila apenas pacotes com arquivos alterados — verificação de tipos rápida no CI.
- Flags estritas eliminam categorias inteiras de bugs antes de chegarem em produção.
- Erros de tipo são detectados no editor (VS Code) em tempo real, não só no CI.
- `exactOptionalPropertyTypes` força contratos de API mais precisos.

**Negativo:**
- `noUncheckedIndexedAccess` aumenta o número de verificações de nulo necessárias — código ligeiramente mais verboso.
- Configuração inicial de project references exige atenção para que cada `tsconfig.json` declare corretamente as dependências entre pacotes.
- Desenvolvedores menos experientes com TypeScript podem ter dificuldade com as mensagens de erro das flags estritas.
