'use client'

/**
 * PageMapaSalasContent — client boundary da página de mapa de sala. Guarda a
 * seleção (sala/turma) e decide o que mostrar: seletor (estado inicial) ou o
 * mapa. Recebe o `CurrentUser` (resolvido no server pelo PageMapaSalas).
 *
 * Fluxo por papel:
 * - Aluno (`STUDENT`): turma fixa (primeira matrícula), seleciona só a sala, e
 *   destaca o próprio assento (`selectedStudentId = user.id`) + rodapé "ponto azul".
 * - Gerência (SENAI/WEG/ADMIN…): seleciona sala e turma, view read-only
 *   (`selectedStudentId = null`), sem rodapé.
 * - Professor/ADMIN (`canEditRoomMap`): além da view, o modo edição (#298) —
 *   orquestrado pelo `RoomMapSection`.
 *
 * Os itens do breadcrumb voltam à seleção (comportamento previsto para a
 * `RoomFilterBar` real do squad — Figma 197-3019). Se houver rascunho de
 * edição não salvo (`isMapDirty`, subido pelo `RoomMapSection`), a volta é
 * confirmada num `ConfirmDialog` de descarte (#298, passo 6).
 *
 * A `RoomFilterBar` final do squad Front-End (Figma 197-3019) ainda não tem PR
 * aberto — a etapa/stepper daqui é montada com os controles reais do DS
 * (`SearchBar`/`Select`, ver `RoomFilterBar.tsx`). `rooms`/`turmas` chegam via
 * prop, já resolvidos no servidor por `PageMapaSalas.tsx` (`hubOptionsService`,
 * TEMP até existir um endpoint dedicado — troque quando o squad entregar o
 * componente oficial). Aluno e gerência usam o mesmo seletor; muda só a etapa
 * de turma (`showTurma`).
 */
import { useState } from 'react'

import type { CurrentUser } from '@portal/core'
import { ConfirmDialog, Text } from '@portal/ui'

import { canEditRoomMap } from '../auth/canEditRoomMap'
import type { RoomFilterOption } from '../types/hub'
import { RoomFilterBar } from './RoomFilterBar'
import { RoomMapSection } from './RoomMapSection'

export interface PageMapaSalasContentProps {
  user: CurrentUser | null
  rooms: RoomFilterOption[]
  turmas: RoomFilterOption[]
}

type CrumbTarget = 'sala' | 'turma'

/**
 * Sem linha permanente — só o sublinhado no hover, do tamanho do próprio
 * item (nada de faixa cheia atrás). Compartilhada pelos dois crumbs
 * (`<button>`) e pelo "Mapa de sala" (`<span>`, não interativo) — mesma
 * borda/padding/transição nos três, só o elemento muda conforme é ou não
 * clicável (docs/conventions/acessibilidade.md: "use o elemento HTML correto
 * antes de recorrer a `role`" — daí `<button>` de verdade, não `<span
 * role="button">`).
 */
const CRUMB_ITEM_CLASSES =
  'border-b-md border-transparent pb-1 transition-colors duration-150 hover:border-border-focus'

// Mesmo anel de foco do StepTab da RoomFilterBar — o crumb é o "modo compacto"
// do mesmo stepper. `border-x-0 border-t-0 bg-transparent p-0`: zera o
// padding/borda padrão de `<button>` do navegador. Sem `rounded-sm`: arredonda
// a caixa inteira, inclusive as pontas da borda de baixo do hover — virava uma
// "pílula" em vez da linha reta simples do "Mapa de sala".
const CRUMB_BUTTON_CLASSES = [
  'cursor-pointer border-x-0 border-t-0 bg-transparent p-0',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-interactive-focus-ring',
  CRUMB_ITEM_CLASSES,
].join(' ')

export function PageMapaSalasContent({ user, rooms, turmas }: PageMapaSalasContentProps) {
  const isStudent = user?.userType === 'STUDENT'
  // Aluno: turma fixa (primeira matrícula). Gerência: escolhida na barra.
  const studentTurmaId = user?.classes[0]?.classId ?? null

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null)

  // Guard de descarte (#298): o RoomMapSection sobe o isDirty do rascunho de
  // edição; trocar sala/turma com rascunho sujo pede confirmação antes.
  const [isMapDirty, setIsMapDirty] = useState(false)
  const [pendingCrumb, setPendingCrumb] = useState<CrumbTarget | null>(null)

  const turmaId = isStudent ? studentTurmaId : selectedTurmaId

  function resetSelection(target: CrumbTarget) {
    if (target === 'sala') setSelectedRoomId(null)
    else setSelectedTurmaId(null)
  }

  function handleCrumbClick(target: CrumbTarget) {
    if (isMapDirty) setPendingCrumb(target)
    else resetSelection(target)
  }

  function handleDiscardConfirm() {
    // Trocar a seleção desmonta o RoomMapSection — o rascunho morre com ele e
    // o próprio unmount devolve isMapDirty=false (cleanup do RoomMapEditMode).
    if (pendingCrumb) resetSelection(pendingCrumb)
    setPendingCrumb(null)
  }

  // Aluno sem matrícula: selecionar sala nunca resolveria a turma (dead-end).
  // Mensagem explícita em vez de um seletor que não avança.
  if (isStudent && !studentTurmaId) {
    return (
      <div className="p-6 md:p-8">
        <Text as="p" variant="body-md" tone="secondary" className="text-center">
          Você ainda não está vinculado a uma turma para visualizar o mapa de sala.
        </Text>
      </div>
    )
  }

  // Estado inicial: falta sala (e, na gerência, turma) → seletor centralizado.
  if (!selectedRoomId || !turmaId) {
    const heading = isStudent
      ? 'Encontre seu lugar no mapa de sala selecionando a sala que deseja visualizar'
      : 'Visualize a posição dos alunos selecionando a sala e turma que deseja visualizar'

    return (
      <div className="flex flex-col items-center gap-14 px-6 py-16 md:py-24">
        <Text as="h1" variant="heading-h1" tone="brand" className="max-w-3xl text-center">
          {heading}
        </Text>
        <div className="w-full max-w-3xl">
          <RoomFilterBar
            rooms={rooms}
            selectedRoomId={selectedRoomId}
            onSelectRoom={setSelectedRoomId}
            showTurma={!isStudent}
            turmas={turmas}
            selectedTurmaId={selectedTurmaId}
            onSelectTurma={setSelectedTurmaId}
          />
        </div>
      </div>
    )
  }

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId)
  const selectedTurma = turmas.find((turma) => turma.id === selectedTurmaId)

  return (
    // `lg:h-full`: 100% da altura real do `<main>` do AppLayout (definida por
    // flexbox — `overflow-y-auto` lá). É a base da cadeia de altura que desce
    // até a `StudentSidebar` em `MapEditor.tsx` — nada de `calc(100vh-Npx)`
    // chutando o tamanho do header/footer/breadcrumb: cada nível só pede
    // "100% do meu pai", e o pai já tem altura definida por flexbox. Sem essa
    // cadeia, a `StudentSidebar` ficava um pouco mais alta do que o espaço
    // real do `<main>` (a estimativa em px nunca bate 100%), e isso fazia o
    // `<main>` ganhar rolagem própria — duas barras de rolagem lado a lado
    // (a do `<main>` e a interna da sidebar).
    <div className="flex flex-col gap-10 p-6 md:p-8 lg:h-full">
      {/* Breadcrumb (mock) — a RoomFilterBar real cobre seleção + breadcrumb.
          Os crumbs voltam à etapa correspondente do seletor. Mesma tipografia/
          cor/espaçamento da "Barra de progresso" do Figma (280-7150): os três
          segmentos em `body-md`/`brand`, `gap-14` (~60px). Sem linha permanente
          — só o sublinhado no hover de cada item, ver `CRUMB_ITEM_CLASSES`. */}
      <nav aria-label="Sala selecionada" className="flex items-center justify-center gap-14">
        {selectedRoom ? (
          <button type="button" className={CRUMB_BUTTON_CLASSES} onClick={() => handleCrumbClick('sala')}>
            <Text as="span" variant="body-md" tone="brand">
              Sala {selectedRoom.code}
            </Text>
          </button>
        ) : null}
        {!isStudent && selectedTurma ? (
          <button type="button" className={CRUMB_BUTTON_CLASSES} onClick={() => handleCrumbClick('turma')}>
            <Text as="span" variant="body-md" tone="brand">
              {selectedTurma.code}
            </Text>
          </button>
        ) : null}
        {/* Não interativo (já é a etapa atual) — `<span>`, não `<button>`:
            não navega pra lugar nenhum, então não é um controle. */}
        <span className={CRUMB_ITEM_CLASSES}>
          <Text as="span" variant="body-md" tone="brand">
            Mapa de sala
          </Text>
        </span>
      </nav>

      {/* `lg:flex-1 lg:min-h-0`: consome o que sobrar da altura do container
          `h-full` acima, depois do breadcrumb — vira a "altura real" que a
          `RoomMapSection` (e, por baixo dela, a `StudentSidebar`) repassa via
          `h-full`. `lg:[&>*]:h-full` força esse "100%" no único filho real
          que a `RoomMapSection` renderiza em cada estado (skeleton, erro,
          grade view ou `RoomMapEditMode`) sem precisar de uma prop de
          className percorrendo cada branch dela. */}
      <div className="lg:min-h-0 lg:flex-1 lg:[&>*]:h-full">
        <RoomMapSection
          // Remonta a seção (e derruba qualquer sessão de edição) se a seleção
          // mudar por qualquer caminho — o rascunho pertence ao par sala+turma.
          key={`${selectedRoomId}:${turmaId}`}
          salaId={selectedRoomId}
          turmaId={turmaId}
          selectedStudentId={isStudent ? (user?.id ?? null) : null}
          showFooter={Boolean(isStudent)}
          canEdit={canEditRoomMap(user, turmaId)}
          onDirtyChange={setIsMapDirty}
        />
      </div>

      <ConfirmDialog
        open={pendingCrumb !== null}
        onClose={() => setPendingCrumb(null)}
        onConfirm={handleDiscardConfirm}
        subTitle="confirmação de:"
        title="Descartar alterações"
        content="Existem alterações não salvas no mapa desta sala. Voltar para a seleção descarta essas alterações."
        labelCancel="Cancelar"
        labelConfirm="Descartar"
        confirmTone="negative"
      />
    </div>
  )
}
