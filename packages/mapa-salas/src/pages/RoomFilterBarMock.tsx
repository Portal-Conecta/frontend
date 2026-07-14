'use client'

/**
 * RoomFilterBarMock — stand-in temporário da `RoomFilterBar` do squad Front-End
 * (Figma 197-3019), que ainda não tem PR aberto. Espelha o frame de seleção do
 * Figma (aluno: node 2004:785 · gerência: node 2004:930): uma barra de progresso
 * com a(s) etapa(s), um campo de busca e a **lista inline** de opções (não um
 * dropdown). Aluno e gerência usam o MESMO componente — muda só a quantidade de
 * etapas.
 *
 * Um fluxo, dois modos via `showTurma`:
 * - Aluno (`false`): só a etapa "Selecionar Sala". A turma é fixa (matrícula),
 *   então escolher a sala já resolve a visualização.
 * - Gerência (`true`): stepper "Selecionar Sala" → "Selecionar Turma". Ao escolher
 *   a sala, avança para a turma; as etapas são clicáveis para voltar; a de turma
 *   só habilita após a sala escolhida.
 *
 * Proposital: NÃO é exportado do barrel — a `RoomFilterBar` real vai dona desse
 * nome/caminho. Quando ela existir, troque o import no `PageMapaSalasContent` e
 * apague este arquivo. A interface de props aqui é o contrato mínimo que a página
 * precisa; alinhar com o squad ao integrar.
 */
import { useState } from 'react'

import { Input, ListItem, Text } from '@portal/ui'

export interface RoomFilterOption {
  /** Id real (backend) da sala/turma — vai na chamada do view. */
  id: string
  /** Número/código exibido à esquerda (ex.: "204", "MIDS-78"). */
  code: string
  /** Descrição (ex.: "Laboratório de informática"). */
  label: string
}

type Step = 'sala' | 'turma'

export interface RoomFilterBarMockProps {
  rooms: RoomFilterOption[]
  selectedRoomId: string | null
  onSelectRoom: (roomId: string) => void
  /** Fluxo de gerência: também seleciona turma. Aluno tem turma fixa → só sala. */
  showTurma?: boolean
  turmas?: RoomFilterOption[]
  selectedTurmaId?: string | null
  onSelectTurma?: (turmaId: string) => void
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

export function RoomFilterBarMock({
  rooms,
  selectedRoomId,
  onSelectRoom,
  showTurma = false,
  turmas = [],
  selectedTurmaId = null,
  onSelectTurma,
}: RoomFilterBarMockProps) {
  const [step, setStep] = useState<Step>('sala')
  const [query, setQuery] = useState('')

  const canSelectTurma = Boolean(selectedRoomId)
  const onTurmaStep = showTurma && step === 'turma'
  const options = onTurmaStep ? turmas : rooms
  const selectedId = onTurmaStep ? selectedTurmaId : selectedRoomId
  const visibleOptions = options.filter((option) => matchesQuery(option, query))

  function goToStep(next: Step) {
    if (next === 'turma' && (!showTurma || !canSelectTurma)) return
    setStep(next)
    setQuery('')
  }

  function handleSelect(optionId: string) {
    if (!onTurmaStep) {
      onSelectRoom(optionId)
      // Gerência: avança para a turma. Aluno: turma fixa, a seleção já resolve.
      if (showTurma) {
        setStep('turma')
        setQuery('')
      }
      return
    }
    onSelectTurma?.(optionId)
  }

  const searchLabel = onTurmaStep ? 'Buscar turma' : 'Buscar sala'

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

      <div className="flex flex-col gap-2">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchLabel}
          aria-label={searchLabel}
        />

        <div>
          {visibleOptions.map((option) => (
            <ListItem
              key={option.id}
              selectable
              selected={option.id === selectedId}
              onClick={() => handleSelect(option.id)}
            >
              <span className="flex items-center gap-3">
                <Text as="span" variant="label-sm" tone="secondary">
                  {option.code}
                </Text>
                <Text as="span" variant="label-sm" tone="secondary">
                  {option.label}
                </Text>
              </span>
            </ListItem>
          ))}

          {visibleOptions.length === 0 ? (
            <Text as="p" variant="label-sm" tone="secondary" className="p-4 text-center">
              Nenhum resultado encontrado.
            </Text>
          ) : null}
        </div>
      </div>
    </div>
  )
}
