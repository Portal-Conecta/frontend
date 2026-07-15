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
 * inteira da área de edição. Mobile não tem frame no protótipo; empilha a
 * lista completa abaixo do grid, sem a moldura (fallback simples = "seletor
 * de lista" citado na issue), virando coluna com moldura a partir do `lg`.
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
  const classes = ['flex flex-col gap-6 lg:flex-row lg:items-stretch', className].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <div className="flex flex-1 flex-col gap-10">
        <MapGrid
          grid={grid}
          draftAllocations={draftAllocations}
          selectedStudentId={selectedStudentId}
          isEditing={isEditing}
          onSeatClick={onSeatClick}
          className={['flex-1', gridClassName].filter(Boolean).join(' ')}
        />
        {footer}
      </div>
      <div
        className={[
          'lg:shrink-0 lg:rounded-tl-lg lg:border-l-md lg:border-t-md lg:border-border-default',
          'lg:bg-background-default lg:p-6',
          // Largura de coluna sem token dedicado — aceitável por
          // docs/conventions/tokens-e-theming.md §5 ("valores arbitrários
          // aceitáveis" para largura de coluna), valor do frame do Figma.
          'lg:w-[398px]',
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
