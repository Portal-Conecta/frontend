/**
 * RoomFilterBarMock — stand-in temporário da `RoomFilterBar` do squad Front-End
 * (Figma 197-3019), que ainda não tem PR aberto. Só cobre a **seleção** (sala e,
 * no fluxo de gerência, turma) usando o `Select` do DS.
 *
 * Proposital: NÃO é exportado do barrel do pacote — a `RoomFilterBar` real vai
 * dona desse nome/caminho. Quando ela existir, troque o import no
 * `PageMapaSalasContent` e apague este arquivo. A interface de props aqui é o
 * contrato mínimo que a página precisa; alinhar com o squad ao integrar.
 */
import { Select, Text, type SelectOption } from '@portal/ui'

export interface RoomFilterOption {
  /** Id real (backend) da sala/turma — vai na chamada do view. */
  id: string
  /** Número/código exibido à esquerda (ex.: "204", "MIDS-78"). */
  code: string
  /** Descrição (ex.: "Laboratório de informática"). */
  label: string
}

export interface RoomFilterBarProps {
  rooms: RoomFilterOption[]
  selectedRoomId: string | null
  onSelectRoom: (roomId: string | null) => void
  /** Fluxo de gerência: também seleciona turma. Aluno tem turma fixa. */
  turmas?: RoomFilterOption[]
  selectedTurmaId?: string | null
  onSelectTurma?: (turmaId: string | null) => void
  /** Mostra o seletor de turma (gerência). */
  showTurma?: boolean
}

function toSelectOptions(items: RoomFilterOption[]): SelectOption[] {
  return items.map((item) => ({ value: item.id, label: `${item.code}  ${item.label}` }))
}

export function RoomFilterBarMock({
  rooms,
  selectedRoomId,
  onSelectRoom,
  turmas = [],
  selectedTurmaId = null,
  onSelectTurma,
  showTurma = false,
}: RoomFilterBarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Text as="label" variant="label-md-emphasis" tone="brand" className="text-center">
          Selecionar Sala
        </Text>
        <Select
          options={toSelectOptions(rooms)}
          value={selectedRoomId}
          onChange={onSelectRoom}
          placeholder="Selecione a sala"
          aria-label="Selecionar sala"
        />
      </div>

      {showTurma ? (
        <div className="flex flex-col gap-2">
          <Text as="label" variant="label-md-emphasis" tone="brand" className="text-center">
            Selecionar Turma
          </Text>
          <Select
            options={toSelectOptions(turmas)}
            value={selectedTurmaId}
            onChange={(value) => onSelectTurma?.(value)}
            placeholder="Selecione a turma"
            aria-label="Selecionar turma"
          />
        </div>
      ) : null}
    </div>
  )
}
