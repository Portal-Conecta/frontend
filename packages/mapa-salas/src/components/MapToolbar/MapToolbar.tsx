// packages/mapa-salas/src/components/MapToolbar/MapToolbar.tsx
//
// Puramente presentacional — não conhece alocações, alunos ou estado do mapa.
// Recebe mode/canSave do useMapaDeSala e só dispara os callbacks correspondentes.

import type { CSSProperties } from 'react'

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

// `shrink-0`: cada Button nunca é espremido pelo flex do container antes do
// `flex-wrap` assumir — sem isso, o navegador encolhe o botão em vez de
// mover ele inteiro pra uma segunda linha. `whitespace-nowrap`: ícone e
// texto nunca quebram linha um em cima do outro dentro do próprio botão.
// Sempre presente, independente do estado hover/active (#[MOBILE-TOOLBAR]).
//
// Abaixo de 422px (largura em que "Limpar Mapa" + "Salvar Alterações" não
// cabem mais lado a lado com o `shrink-0` acima) trocamos de estratégia: em
// vez de deixar o `flex-wrap` do container empurrar o botão inteiro pra uma
// segunda linha, permitimos que ESTE botão encolha (`shrink`/`min-w-0`) e
// truncamos só o texto (ver `<span className="min-w-0 truncate">` abaixo) — o ícone
// tem `shrink-0` próprio, então nunca é cortado, só o texto ganha reticências
// se não couber. Mantém os dois botões sempre na mesma linha nessa faixa.
const toolbarButtonBaseClasses = 'shrink-0 whitespace-nowrap max-[421px]:min-w-0 max-[421px]:shrink'

// Padding HORIZONTAL fluido do Button abaixo de `lg` — quando os botões
// empilham (um por linha, ver `containerClasses`), o `px-4` nativo do
// Button (16px de cada lado) deixa cada um "gordo" sozinho na própria
// linha. Só o eixo X encolhe (8px → 16px, mesmo teto do `px-4` original);
// o `py-2` (8px) do Button fica intocado — é o que garante a altura de
// toque (~40px, exigida pela issue #[MOBILE-TOOLBAR]) mesmo no mobile mais
// estreito. `clamp()` em vez de um valor fixo por breakpoint: continua
// encolhendo suavemente conforme a tela encolhe (320px→640px), sem o salto
// único que uma classe `max-lg:` daria — acima de 640px o clamp já está no
// teto de 16px, idêntico ao padrão do Button, então não precisa de `lg:`
// pra "desligar" nada. Via `style` (não Tailwind arbitrary value — a
// fórmula usa variável, e Tailwind escaneia estaticamente): `style` já
// vence uma classe normal do Button (px-4 não é `!important`), sem precisar
// do truque `!` usado em `noHoverActive*` acima.
const TOOLBAR_BUTTON_PAD_X_MIN = 8
const TOOLBAR_BUTTON_PAD_X_MAX = 16
const TOOLBAR_BUTTON_PAD_X_VIEWPORT_MIN = 320
const TOOLBAR_BUTTON_PAD_X_VIEWPORT_MAX = 640

const fluidPadX = (() => {
  const slope = TOOLBAR_BUTTON_PAD_X_MAX - TOOLBAR_BUTTON_PAD_X_MIN
  const viewportRange = TOOLBAR_BUTTON_PAD_X_VIEWPORT_MAX - TOOLBAR_BUTTON_PAD_X_VIEWPORT_MIN
  return `clamp(${TOOLBAR_BUTTON_PAD_X_MIN}px, calc(${TOOLBAR_BUTTON_PAD_X_MIN}px + ${slope} * (100vw - ${TOOLBAR_BUTTON_PAD_X_VIEWPORT_MIN}px) / ${viewportRange}), ${TOOLBAR_BUTTON_PAD_X_MAX}px)`
})()

const toolbarButtonFluidStyle: CSSProperties = {
  paddingLeft: fluidPadX,
  paddingRight: fluidPadX,
}

export function MapToolbar({ mode, canSave, onEdit, onClear, onSave, className }: MapToolbarProps) {
  // Largura: "hug contents" (auto) — o container cresce/encolhe sozinho
  // conforme o conteúdo (162px com 1 botão, 339px com 2 no desktop), sem
  // valor fixo. Altura: fixada em 48px (h-12) e padding 24/12
  // horizontal/vertical no desktop (lg+), conforme specs do Figma
  // (Espaçamento 24 · 12, Redimensionamento A 48) — inalterado a partir de
  // `lg`. gap-6 = 24px já bate com o "Espaço" do auto-layout entre os
  // botões (desktop).
  //
  // Mobile (#[MOBILE-TOOLBAR]): sem `flex-wrap`, o container não move os
  // botões pra uma segunda linha quando não cabem — ele os encolhe
  // (flex-shrink padrão), e aí o CONTEÚDO de cada botão (ícone + texto) é
  // que quebra em duas linhas por falta de espaço, estourando a altura
  // fixa (`h-12`) e deixando tudo desproporcional. `gap-3 px-4` (em vez de
  // `gap-6 px-6`) reduz o hug-content sem sair da escala de spacing do DS.
  // `max-w-full flex-wrap justify-center` é a rede de segurança: se ainda
  // assim não coubesse, os BOTÕES INTEIROS quebram pra uma segunda linha
  // centralizada (flex-wrap move o item inteiro, não encolhe o conteúdo
  // dele) — nunca corta nem deixa o ícone/texto quebrado dentro do botão.
  // `min-h-12` (em vez de `h-12` fixo) permite essa segunda linha crescer;
  // no desktop (`lg:h-12 lg:flex-nowrap`) o comportamento de altura
  // fixa/uma linha só do Figma continua garantido. Não mexe no `Button` do
  // DS (padding/alvo de toque do botão em si ficam como estão).
  const containerClasses = [
    'inline-flex min-h-12 max-w-full flex-wrap items-center justify-center gap-3 rounded-lg',
    'border-sm border-border-default bg-background-surface px-4 py-3',
    // Abaixo de 422px, ver comentário de `toolbarButtonBaseClasses`: os
    // botões encolhem (com texto truncado) em vez do container quebrar em
    // duas linhas, então o `flex-wrap` é desligado nessa faixa.
    'max-[421px]:flex-nowrap',
    'lg:h-12 lg:flex-nowrap lg:gap-6 lg:px-6',
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
        <Button
          variant="ghost"
          tone="brand"
          className={`${toolbarButtonBaseClasses} ${noHoverActiveBrand}`}
          style={toolbarButtonFluidStyle}
          onClick={onEdit}
        >
          <SquarePenIcon className={`${iconSizeClasses} shrink-0`} />
          <span className="min-w-0 truncate">Editar Mapa</span>
        </Button>
      </div>
    )
  }

  return (
    <div className={containerClasses}>
      <Button
        variant="ghost"
        tone="negative"
        className={`${toolbarButtonBaseClasses} ${noHoverActiveNegative}`}
        style={toolbarButtonFluidStyle}
        onClick={onClear}
      >
        <TrashIcon className={`${iconSizeClasses} shrink-0`} />
        <span className="min-w-0 truncate">Limpar Mapa</span>
      </Button>

      {/*
        Salvar Alterações: SÓ recebe o override de hover/active quando canSave
        for true. Enquanto canSave=false (nem todos os alunos alocados), o
        botão fica cinza e não deve ficar azul ao toque — deixamos o próprio
        Button (disabled nativo) cuidar disso, sem nosso className por cima.
        `toolbarButtonBaseClasses` (shrink-0/whitespace-nowrap) sempre entra,
        independente do estado.
      */}
      <Button
        variant="ghost"
        tone="brand"
        className={canSave ? `${toolbarButtonBaseClasses} ${noHoverActiveBrand}` : toolbarButtonBaseClasses}
        style={toolbarButtonFluidStyle}
        disabled={!canSave}
        onClick={onSave}
      >
        <SaveIcon className={`${iconSizeClasses} shrink-0`} />
        <span className="min-w-0 truncate">Salvar Alterações</span>
      </Button>
    </div>
  )
}
