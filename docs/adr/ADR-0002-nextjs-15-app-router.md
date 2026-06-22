# ADR-0002: Next.js 15 com App Router como Shell da Aplicação

## Status
Aceita

## Data
2026-05-25

## Contexto

O Portal Conecta precisa de um ponto único de entrada para todas as funcionalidades: roteamento, autenticação, layout global e integração com o backend. Precisávamos escolher o framework de rendering e como estruturar o shell da aplicação.

Alternativas consideradas:
- **Vite + React SPA**: simples, rápido para desenvolver, mas sem SSR nativo e sem convenções de roteamento.
- **Remix**: bom modelo de dados (loaders/actions), mas menor ecossistema e curva de aprendizado para o time.
- **Astro**: excelente para sites estáticos, mas não tem boa história com aplicações altamente interativas e SPAs complexas.
- **Next.js com Pages Router**: maduro e bem documentado, mas o App Router é o futuro oficial da plataforma.

## Decisão

Adotamos o **Next.js 15** com **App Router** (diretório `app/`) como único shell da aplicação, localizado em `apps/root`.

Todos os pacotes de domínio (`@portal/comunicados`, `@portal/checklist`, `@portal/mapa-salas`) são importados pelo shell e não possuem servidor próprio. O React foi fixado na versão **19**, compatível com Next.js 15 e necessário para Server Components e Actions.

## Consequências

**Positivo:**
- React Server Components permitem buscar dados diretamente em componentes sem boilerplate de estado client-side.
- Roteamento baseado em arquivos reduz configuração manual e torna a estrutura de páginas previsível.
- Streaming e Suspense nativos melhoram a experiência de carregamento percebido.
- Único ponto de entrada facilita controle de autenticação, layout e meta tags.
- Alinhado com a direção oficial do ecossistema React/Vercel.

**Negativo:**
- A distinção entre Server Components e Client Components adiciona complexidade conceitual — desenvolvedores precisam entender os limites de cada um.
- Debugging de erros de hidratação pode ser não-trivial.
- Migrar para outra plataforma de hosting que não suporte Next.js requer adaptação (ex: export estático perde funcionalidades de server).
