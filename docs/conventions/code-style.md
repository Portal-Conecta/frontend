# Convenção: Estilo de Código

**Público:** squads operacionais (e plataforma).

## App Router e Server Components

O Next.js App Router é o padrão. **Server Component é o default**: não declare `'use client'` por precaução.

Adicione `'use client'` somente quando o arquivo usa `useState`, `useEffect`, `useRef` ou define event handler direto. O critério é objetivo, sem exceção por garantia.

```tsx
// Server Component (default, sem declaração)
export function Secao({ children }: { children: ReactNode }) {
  return <section>{children}</section>
}

// Client Component (só quando necessário)
'use client'
export function Filtro() {
  const [q, setQ] = useState('')
  // ...
}
```

## Data fetching

- Busca de dados acontece em Server Component sempre que possível, sem JavaScript no cliente.
- Componentes client recebem dados por props ou usam hooks apenas para interação.
- Evite buscar dados em `useEffect` quando a busca pode ser feita no servidor.

## Estado

- Estado local fica no componente que o usa. Suba o estado só até onde ele precisa ser compartilhado.
- Estado de UI de um shell (ex.: `expanded` da Sidebar) é do shell, não da folha. Ver [layout-e-paginas](layout-e-paginas.md).

## Nomenclatura

- Componentes em PascalCase; arquivo e diretório têm o mesmo nome do componente.
- Funções nomeadas e exportadas, nunca anônimas.
- Tipos e interfaces exportados antes da implementação.
- Imports: tipos primeiro (`import type`), depois módulos.

Detalhe de autoria de componentes do DS em [creating-components](creating-components.md).
