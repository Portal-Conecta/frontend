# Portal Conecta

Portal interno do CentroWEG. Reúne em uma interface única os módulos de comunicados, checklist de sala e mapa de salas.

Monorepo em pnpm workspaces com Next.js 15, React 19, TypeScript estrito e Tailwind CSS v4.

## Requisitos

- Node 22.13 ou superior
- pnpm 11 ou superior

## Instalação

```bash
pnpm install
```

## Variáveis de ambiente

As variáveis ficam em `apps/root` — o Next as carrega a partir do diretório do app. Copie o template e ajuste:

```bash
cp apps/root/.env.example apps/root/.env.local
```

| Variável | Lado | Descrição |
|---|---|---|
| `API_URL` | servidor | Base do back-end usada pelos Route Handlers (`/api/auth/*`). Privada, não exposta ao browser. Padrão: `http://localhost:8090`. |
| `NEXT_PUBLIC_API_URL` | cliente | Base do back-end para chamadas diretas do browser (uso futuro). |
| `NEXT_PUBLIC_APP_ENV` | cliente | Ambiente da aplicação (`development`, `production`). |

O `.env.local` é ignorado pelo Git. Reinicie o `pnpm dev` após alterá-lo — o Next lê as variáveis só na inicialização.

## Rodando localmente

```bash
pnpm dev
```

Sobe o shell em `http://localhost:3000`. O back-end precisa estar no endereço de `API_URL`; sem ele, o login responde como serviço indisponível.

## Design system

```bash
pnpm storybook        # Storybook do @portal/ui em http://localhost:6006
pnpm build-storybook  # build estático
```

## Verificação

Os mesmos portões que o CI roda (ver `.github/workflows/ci.yml`):

```bash
pnpm lint          # ESLint: fronteiras de import, token sem hardcode
pnpm check:stories # toda story irmã presente em ui
pnpm typecheck     # tsc --build em modo estrito
pnpm test          # Vitest (lógica de core/shared/scripts)
pnpm build         # build de produção
pnpm test:a11y     # axe sobre as stories (consultivo)
```

## Estrutura

```
apps/
  root/           shell Next.js: rotas, layouts globais, middleware de auth
packages/
  shared/         tipos e utilitários sem React
  ui/             design system: tokens, atoms, molecules, organisms
  core/           auth, layout (AppLayout), páginas e serviços compartilhados
  comunicados/    domínio: comunicados internos
  checklist/      domínio: checklist de sala
  mapa-salas/     domínio: mapa de salas
```

Cada camada importa apenas das camadas abaixo. Domínios nunca importam outros domínios.

## Documentação

- [AGENTS.md](AGENTS.md) — ponto de entrada de regras e arquitetura.
- [CONTRIBUTING.md](CONTRIBUTING.md) — GitFlow, commits e PRs.
- [docs/](docs/README.md) — convenções e ADRs.
