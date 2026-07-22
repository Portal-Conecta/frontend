import type { ReactNode } from 'react'

import type { RoomMapGrid, UnassignedStudent } from '../../types'
import { MapGrid } from '../MapGrid'
import { StudentSidebar } from '../StudentSidebar'

export type MapEditorProps = {
  /** Dimensões e posições vindas da API (estático — vem de `view.grid`) */
  grid: RoomMapGrid
  /** Rascunho de alocações do `useMapaDeSala` — repassado ao `MapGrid` */
  draftAllocations: Map<string, UnassignedStudent>
  /** Alunos não alocados do `useMapaDeSala` — repassado à `StudentSidebar` */
  unassignedStudents: UnassignedStudent[]
  selectedStudentId: string | null
  /** Quando true, assentos e itens da sidebar respondem a clique */
  isEditing: boolean
  /** `handleSeatClick` do `useMapaDeSala` */
  onSeatClick: (layoutPositionId: string) => void
  /** `selectStudent` do `useMapaDeSala` */
  onStudentClick: (studentId: string) => void
  /**
   * `handleBenchClick` do `useMapaDeSala` — clique na área vazia da
   * sidebar (fora de qualquer item). Se o aluno selecionado está sentado
   * num assento, devolve-o ao banco.
   */
  onBenchAreaClick: () => void
  /**
   * Slot renderizado sob o grid, dentro da coluna esquerda — no frame de
   * edição do Figma o `MapToolbar` (e o alerta de aluno sem lugar) centraliza
   * na área do grid, não na largura total (a coluna de alunos segue inteira à
   * direita). Quem monta o slot é a página (#298).
   */
  footer?: ReactNode
  /**
   * Classes extras do `MapGrid` (ex.: `MAP_GRID_GAP` da página) — o grid não
   * define gap próprio (ver TODO(design) em `MapGrid.tsx`).
   */
  gridClassName?: string
  className?: string
}

/**
 * MapEditor — composição responsiva de `MapGrid` + `StudentSidebar` para o
 * modo edição do mapa de sala.
 *
 * Decisão de composição (a issue #297 deixava em aberto "MapEditor no pacote
 * ou composição direta na página, decidir no PR com o padrão mais simples"):
 * este componente é puramente apresentacional — não chama `useMapaDeSala` nem
 * renderiza `MapToolbar`/`ConfirmDialog`/`Toast` (fora do escopo da issue). O
 * `MapToolbar` mostra o mesmo `isDirty` do rascunho e dispara `onSave`/
 * `onClear`, então quem possui o hook de estado (a página, em #298) precisa
 * alimentar toolbar e grid com o mesmo estado — por isso o hook fica no
 * consumidor, e este componente só recebe as fatias já resolvidas.
 *
 * Sem hooks/handlers próprios — mesmo padrão do `MapGrid` (recebe função via
 * prop mas não declara 'use client'); a `StudentSidebar` é 'use client' por
 * conta própria (precisa distinguir clique em item de clique na área vazia).
 * De todo modo, `MapEditor` precisa ser renderizado dentro de uma árvore que
 * já tenha um Client Component boundary acima (a página que chama
 * `useMapaDeSala`), já que repassa funções como `onSeatClick`/`onStudentClick`.
 *
 * Layout conferido contra o protótipo (node 2008:36012/2008:36092 do Figma
 * `qGo0ACyYHgWTYvenzzwSLG`): no desktop a `StudentSidebar` não é uma lista
 * solta ao lado do grid — é uma coluna direita com moldura própria (borda,
 * canto superior arredondado, fundo `background-default`), ocupando a altura
 * inteira da área de edição. No mobile (#429) empilha a lista completa abaixo
 * do grid, mas mantém a moldura como um card fechado nos quatro cantos (sem o
 * corte do lado direito, que só existe a partir do breakpoint arbitrário
 * `min-[1440px]:` quando a coluna encosta na borda da viewport via `-mr-8`).
 * Os breakpoints padrão (`lg`=1024/`xl`=1280) não bastam: nessa faixa a
 * `StudentSidebar` ainda comeria espaço da grade antes do layout ter largura
 * de sobra, por isso o `MapGrid` mantém seu próprio scroll horizontal e piso
 * de largura por assento fluido, sempre ativo (`MAP_GRID_MIN_SEAT_WIDTH`, ver
 * `components/seatSizing.ts`) — esse é independente do breakpoint de layout
 * (reage à largura real do grid, não ao viewport). A coluna esquerda não
 * precisa de tratamento adicional pra isso, já é `flex-col` full-width em
 * qualquer largura. `1440px` é repetido como variante arbitrária em vez de
 * token nomeado no `tailwind.config.ts` (que exigiria aprovação do squad de
 * Front-End) — precisa bater com `RoomMapSection.tsx`/`PageMapaSalasContent.tsx`.
 *
 * A raiz deste componente espera receber `h-full` de quem o renderiza (hoje,
 * `PageMapaSalasContent.tsx` via `[&>*]:h-full` numa cadeia de `h-full`/
 * `flex-1`/`min-h-0` que nasce no `<main>` do AppLayout, também com o mesmo
 * `min-[1440px]:` — ver `RoomMapSection.tsx`/`PageMapaSalasContent.tsx`) — com
 * isso definido, `min-[1440px]:items-stretch` faz a coluna da `StudentSidebar`
 * esticar sozinha até essa altura real, sem precisar de nenhum
 * `h-[calc(100vh-Npx)]` chutando o tamanho do header/footer/breadcrumb da
 * página.
 */
export function MapEditor({
  grid,
  draftAllocations,
  unassignedStudents,
  selectedStudentId,
  isEditing,
  onSeatClick,
  onStudentClick,
  onBenchAreaClick,
  footer,
  gridClassName,
  className,
}: MapEditorProps) {
  const classes = ['flex flex-col gap-6 min-[1440px]:flex-row min-[1440px]:items-stretch', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <div className="flex flex-1 flex-col gap-10">
        <MapGrid
          grid={grid}
          draftAllocations={draftAllocations}
          selectedStudentId={selectedStudentId}
          isEditing={isEditing}
          onSeatClick={onSeatClick}
          {...(gridClassName ? { className: gridClassName } : {})}
        />
        {/* `mt-auto`: ancora o toolbar/alerta na base da coluna (Figma — fica
            perto da borda inferior do frame, não colado na última fileira de
            assentos). Só funciona porque a coluna tem altura definida — ela é
            esticada por `items-stretch` até a altura fixa da StudentSidebar
            (ver comentário na coluna direita). */}
        {footer ? <div className="mt-auto">{footer}</div> : null}
      </div>
      <div
        className={[
           // Mobile: cartão fechado nos quatro cantos/lados — a lista empilha
           // cheia abaixo do grid, então a moldura vira um card comum, sem o
           // corte do lado direito que só faz sentido na coluna a partir de
           // min-[1440px] (ver abaixo).
           'rounded-lg border-md border-border-default bg-background-default p-4',
           // A partir de 1440px vira coluna à direita que encosta na borda da
           // viewport (`-mr-8` abaixo) — por isso os cantos/borda direita são
           // zerados aqui, sobrando só o "L" (topo + esquerda + base).
           // Breakpoint arbitrário — não token nomeado no tailwind.config.ts
           // (exigiria aprovação do squad de Front-End) — precisa bater com
           // `RoomMapSection.tsx`/`PageMapaSalasContent.tsx`.
           'min-[1440px]:shrink-0 min-[1440px]:rounded-tr-none min-[1440px]:rounded-br-none min-[1440px]:border-r-0',
            // Largura escala continuamente via clamp — exceção do §5 p/ largura
            // de coluna sem token dedicado (docs/conventions/tokens-e-theming.md).
            'min-[1440px]:w-[clamp(280px,26vw,398px)]',
            // Padding não pode ser valor arbitrário (§3 — eslint
            // no-restricted-syntax exige escala do DS). p-4 (16px) já é o
            // padrão mobile-first (base acima); sobe pra p-6 (24px, valor do
            // Figma) assim que vira coluna desktop — a clamp da largura já
            // cuida do crescimento gradual, sem precisar de outro degrau.
            'min-[1440px]:p-6',
            // Cancela o `md:p-8` (32px) da página no lado direito — no Figma a
            // coluna encosta na borda da viewport, mas o container da página tem
            // padding nos quatro lados (mesmo padding serve pro conteúdo restante:
            // breadcrumb, seletor, mensagens de erro/vazio).
            'min-[1440px]:-mr-8',
        ].join(' ')}
      >
        <StudentSidebar
          unassignedStudents={unassignedStudents}
          selectedStudentId={selectedStudentId}
          isEditing={isEditing}
          onStudentClick={onStudentClick}
          onEmptyAreaClick={onBenchAreaClick}
        />
      </div>
    </div>
  )
}
