// packages/mapa-salas/src/components/MapToolbar/MapToolbar.tsx
//
// Puramente presentacional — não conhece alocações, alunos ou estado do mapa.
// Recebe mode/canSave do useMapaDeSala e só dispara os callbacks correspondentes.

import { Button } from '@portal/ui'

// TODO(#116): trocar por iconLeft="square-pen"|"trash"|"save" (prop nativa do
// Button) quando o squad de Front-End aprovar os 3 ícones em
// packages/ui/src/atoms/Icon/icons.ts. Ver ToolbarIcons.tsx para o motivo do
// fallback local — `iconLeft` do Button espera um IconName (string) do
// registry, não aceita ReactNode, então por ora o ícone é composto manualmente
// dentro de `children`, sem usar a prop `iconLeft`.
import { SaveIcon, SquarePenIcon, TrashIcon } from './ToolbarIcons'

export type MapToolbarMode = 'view' | 'edit'

export type MapToolbarProps = {
  /** Modo atual do mapa — controla quais botões aparecem */
  mode: MapToolbarMode
  /**
   * true quando todos os alunos da turma têm assento alocado no draft.
   * Habilita "Salvar Alterações" em modo edição. Ignorado em modo visualização.
   */
  canSave: boolean
  /** Alterna para modo edição */
  onEdit: () => void
  /** Abre o ClearMapModal — não reseta alocações diretamente, nunca chama API */
  onClear: () => void
  /** Dispara o save (POST ou PUT, decidido pelo useMapaDeSala) */
  onSave: () => void
  className?: string
}

// Tamanho do ícone confirmado: pequeno (mobile) = 16px · grande (desktop) = 24px.
// Equivalem aos tokens sm/md do Icon (packages/ui/src/atoms/Icon/Icon.tsx:
// sizePx.sm=16, sizePx.md=24) — mesma escala 16/24/32 documentada no JSDoc do
// Icon ("stroke 2px fixo, tamanhos 16/24/32").
const iconSizeClasses = 'h-4 w-4 lg:h-6 lg:w-6'

// O Button do DS (variant="ghost") sempre aplica hover E active quando
// HABILITADO (muda cor de texto/fundo em ambos os estados). O frame não tem
// esse efeito nos botões ativos, então neutralizamos aqui.
//
// IMPORTANTE: isso só pode ser aplicado quando o botão está habilitado. O
// ghost já trata corretamente o caso disabled nativamente
// (`disabled:text-text-disabled disabled:hover:bg-transparent`) — se
// empilhássemos esse override também no estado disabled, o `!important`
// venceria a cor cinza nativa e o botão voltaria a ficar azul ao toque mesmo
// desabilitado (bug relatado: "Salvar Alterações" ficando azul ao tocar antes
// de canSave=true). Por isso a Button de Salvar só recebe esse className
// quando canSave=true.
//
// Tailwind CSS v4 mudou a sintaxe do modificador important: o `!` vai DEPOIS
// da utility (`bg-transparent!`), não antes (`!bg-transparent`, sintaxe do v3).
//
// Também resetamos o tap-highlight nativo do WebKit/Chrome mobile (camada
// cinza/azulada que o navegador desenha em qualquer elemento tocável,
// independente de :hover/:active em CSS).
//
// Ideal seria o Button aceitar uma variante "estática"/sem hover-active
// nativamente; levar essa conversa ao squad junto com a aprovação dos ícones.
const noHoverActiveBrand =
  'hover:bg-transparent! hover:text-interactive-default! active:bg-transparent! active:text-interactive-default! ' +
  '[-webkit-tap-highlight-color:transparent]'
const noHoverActiveNegative =
  'hover:bg-transparent! hover:text-interactive-negative-default! active:bg-transparent! active:text-interactive-negative-default! ' +
  '[-webkit-tap-highlight-color:transparent]'

export function MapToolbar({ mode, canSave, onEdit, onClear, onSave, className }: MapToolbarProps) {
  // Largura: "hug contents" (auto) — o container cresce/encolhe sozinho
  // conforme o conteúdo (162px com 1 botão, 339px com 2), sem valor fixo.
  // Altura: fixada em 48px (h-12) e padding 24/12 horizontal/vertical,
  // conforme specs do Figma (Espaçamento 24 · 12, Redimensionamento A 48).
  // gap-6 = 24px já bate com o "Espaço" do auto-layout entre os botões.
  const containerClasses = [
    'inline-flex h-12 items-center gap-6 rounded-lg border-sm border-border-default bg-background-surface px-6 py-3',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // Correção vs. tabela original da issue: os screenshots do frame real mostram
  // "Editar Mapa" sozinho em view, e ele SOME por completo ao entrar em modo
  // edição (não fica desabilitado ao lado dos outros dois) — troca de conjunto
  // de botões por mode, não disabled em todos os estados.
  if (mode === 'view') {
    return (
      <div className={containerClasses}>
        <Button variant="ghost" tone="brand" className={noHoverActiveBrand} onClick={onEdit}>
          <SquarePenIcon className={iconSizeClasses} />
          Editar Mapa
        </Button>
      </div>
    )
  }

  return (
    <div className={containerClasses}>
      <Button variant="ghost" tone="negative" className={noHoverActiveNegative} onClick={onClear}>
        <TrashIcon className={iconSizeClasses} />
        Limpar Mapa
      </Button>

      {/*
        Salvar Alterações: SÓ recebe o override de hover/active quando canSave
        for true. Enquanto canSave=false (nem todos os alunos alocados), o
        botão fica cinza e não deve ficar azul ao toque — deixamos o próprio
        Button (disabled nativo) cuidar disso, sem nosso className por cima.
      */}
      <Button
        variant="ghost"
        tone="brand"
        className={canSave ? noHoverActiveBrand : undefined}
        disabled={!canSave}
        onClick={onSave}
      >
        <SaveIcon className={iconSizeClasses} />
        Salvar Alterações
      </Button>
    </div>
  )
}
