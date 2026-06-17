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

Copie o arquivo de exemplo e ajuste os valores para o seu ambiente:

```bash
cp .env.example .env.local
```

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base da API (padrão: `http://localhost:8080`) |
| `NEXT_PUBLIC_AUTH_SECRET` | Segredo usado para assinar a sessão |
| `NEXT_PUBLIC_SESSION_EXPIRY` | Tempo de expiração da sessão em segundos |
| `NEXT_PUBLIC_APP_ENV` | Ambiente (`development`, `production`) |

## Rodando localmente

```bash
pnpm dev
```

Sobe o shell da aplicação em `http://localhost:3000`. O backend precisa estar em execução no endereço configurado em `NEXT_PUBLIC_API_URL`.

## Design system

```bash
pnpm storybook
```

Abre o Storybook do `@portal/ui` em `http://localhost:6006`, com todos os componentes isolados e documentados.

## Verificação

```bash
pnpm typecheck   # checagem de tipos em todos os pacotes
pnpm lint        # ESLint recursivo
```

## Estrutura

```
apps/
  root/           shell Next.js: rotas, layouts globais, middleware de auth
packages/
  shared/         tipos e utilitários sem React
  ui/             design system: tokens, atoms, molecules, organisms
  core/           auth, layouts de page, serviços compartilhados
  comunicados/    domínio: comunicados internos
  checklist/      domínio: checklist de sala
  mapa-salas/     domínio: mapa de salas
```

Cada camada importa apenas das camadas abaixo. Domínios nunca importam outros domínios.

Para contribuir, leia [CONTRIBUTING.md](CONTRIBUTING.md). Para entender decisões de arquitetura, veja [docs/adr/README.md](docs/adr/README.md).
