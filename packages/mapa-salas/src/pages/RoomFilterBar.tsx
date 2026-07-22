'use client'

/**
 * RoomFilterBar — seleção de sala (e, na gerência, turma) para o Mapa de Sala.
 * Monta a barra de progresso do fluxo por cima dos controles reais do DS:
 * `SearchBar` (etapa "Selecionar Sala") e `Select` (etapa "Selecionar Turma").
 * Substitui o antigo `RoomFilterBarMock`, que reimplementava campo de busca +
 * lista na mão — agora é só a etapa/estado local, a UI vem de `@portal/ui`.
 *
 * Ainda não é a `RoomFilterBar` final do squad Front-End (Figma 197-3019): o
 * layout de duas etapas (barra de progresso + campo) é o mesmo, mas a
 * composição exata do frame pode divergir. Quando o componente oficial existir,
 * troque o import no `PageMapaSalasContent` e apague este arquivo.
 *
 * Um fluxo, dois modos via `showTurma`:
 * - Aluno (`false`): só a etapa "Selecionar Sala". A turma é fixa (matrícula),
 *   então escolher a sala já resolve a visualização.
 * - Gerência (`true`): stepper "Selecionar Sala" → "Selecionar Turma". Ao escolher
 *   a sala, avança para a turma; as etapas são clicáveis para voltar; a de turma
 *   só habilita após a sala escolhida.
 */
import { useState } from 'react'

import { SearchBar, Select, Text, type SearchBarItem, type SelectOption } from '@portal/ui'

export interface RoomFilterOption {
  /** Id real (backend) da sala/turma — vai na chamada do view. */
  id: string
  /** Número/código exibido à esquerda (ex.: "204", "MIDS-78"). */
  code: string
  /** Descrição (ex.: "Laboratório de informática"). */
  label: string
}

type Step = 'sala' | 'turma'

export interface RoomFilterBarProps {
  rooms: RoomFilterOption[]
  selectedRoomId: string | null
  onSelectRoom: (roomId: string) => void
  /** Fluxo de gerência: também seleciona turma. Aluno tem turma fixa → só sala. */
  showTurma?: boolean
  turmas?: RoomFilterOption[]
  selectedTurmaId?: string | null
  onSelectTurma?: (turmaId: string) => void
}

function toSearchBarItem(option: RoomFilterOption): SearchBarItem {
  return { value: option.id, label: option.label, meta: option.code }
}

function toSelectOption(option: RoomFilterOption): SelectOption {
  return { value: option.id, label: `${option.code} — ${option.label}` }
}

function matchesQuery(option: RoomFilterOption, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return `${option.code} ${option.label}`.toLowerCase().includes(q)
}

interface StepTabProps {
  label: string
  active: boolean
  disabled?: boolean
  onClick: () => void
}

function StepTab({ label, active, disabled = false, onClick }: StepTabProps) {
  return (
    <button
      type="button"
      aria-current={active ? 'step' : undefined}
      disabled={disabled}
      onClick={onClick}
      className={[
        'pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-interactive-focus-ring',
        active ? 'border-b border-interactive-default' : '',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Text as="span" variant={active ? 'label-md-emphasis' : 'body-md'} tone="brand">
        {label}
      </Text>
    </button>
  )
}

export function RoomFilterBar({
  rooms,
  selectedRoomId,
  onSelectRoom,
  showTurma = false,
  turmas = [],
  selectedTurmaId = null,
  onSelectTurma,
}: RoomFilterBarProps) {
  const [step, setStep] = useState<Step>('sala')
  // Filtro da etapa "sala": a `SearchBar` base é controlada (não busca sozinha),
  // então o filtro por texto sobre a lista já carregada continua aqui. Com
  // `openOnFocus`, focar já abre a lista completa — o usuário não precisa
  // adivinhar um termo para descobrir quais salas existem (#435).
  const [roomQuery, setRoomQuery] = useState('')

  const canSelectTurma = Boolean(selectedRoomId)
  const onTurmaStep = showTurma && step === 'turma'

  function goToStep(next: Step) {
    if (next === 'turma' && (!showTurma || !canSelectTurma)) return
    setStep(next)
    setRoomQuery('')
  }

  function handleSelectRoom(item: SearchBarItem) {
    onSelectRoom(item.value)
    // Gerência: avança para a turma. Aluno: turma fixa, a seleção já resolve.
    if (showTurma) {
      setStep('turma')
      setRoomQuery('')
    }
  }

  function handleSelectTurma(value: string | null) {
    if (value) onSelectTurma?.(value)
  }

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? null
  const visibleRoomItems = rooms.filter((room) => matchesQuery(room, roomQuery)).map(toSearchBarItem)
  const turmaOptions = turmas.map(toSelectOption)

  return (
    <div className="flex flex-col gap-6">
      {/* Barra de progresso: etapa(s) da seleção. */}
      <div className="flex items-center justify-center gap-14">
        <StepTab label="Selecionar Sala" active={step === 'sala'} onClick={() => goToStep('sala')} />
        {showTurma ? (
          <StepTab
            label="Selecionar Turma"
            active={step === 'turma'}
            disabled={!canSelectTurma}
            onClick={() => goToStep('turma')}
          />
        ) : null}
      </div>

      {onTurmaStep ? (
        <Select
          options={turmaOptions}
          value={selectedTurmaId}
          onChange={handleSelectTurma}
          placeholder="Buscar turma"
          aria-label="Buscar turma"
          emptyMessage="Nenhum resultado encontrado."
          clearable
        />
      ) : (
        <SearchBar
          items={visibleRoomItems}
          selectedItem={selectedRoom ? toSearchBarItem(selectedRoom) : null}
          onSelect={handleSelectRoom}
          onQueryChange={setRoomQuery}
          openOnFocus
          clearOnSelect={false}
          placeholder="Buscar sala"
          aria-label="Buscar sala"
          emptyMessage="Nenhum resultado encontrado."
        />
      )}
    </div>
  )
}
