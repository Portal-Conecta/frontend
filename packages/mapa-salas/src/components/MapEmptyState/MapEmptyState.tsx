/**
 * MapEmptyState — estado vazio exibido quando não há mapa configurado para a
 * sala e turma selecionadas.
 *
 * A decisão de quando renderizar este componente é do PageMapaSalas — este
 * componente não sabe nada sobre esse fluxo, apenas propaga o clique do botão
 * via `onCreateMap`. Zero lógica de negócio.
 */
import { Button, Text } from '@portal/ui'

import { SeatIcon } from '../SeatIcon'

export type MapEmptyStateProps = {
  /** Disparado ao clicar em "Criar Mapa de Sala" */
  onCreateMap: () => void
  className?: string
}

export function MapEmptyState({ onCreateMap, className }: MapEmptyStateProps) {
  const classes = [
    'flex flex-col items-center justify-center gap-1 p-20 text-center',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <Text variant="heading-h2" className="whitespace-nowrap">Mapa não encontrado</Text>

      {/* "?" como Text (não SVG): frame real do Figma mostra o "?" empilhado
          acima do SeatIcon, não sobreposto — diverge do texto da issue #136,
          que pedia SVG absoluto. Ambos herdam text-text-disabled via
          currentColor, mesmo padrão do SeatCard. */}
      <div className="flex flex-col items-center mt-14 mb-14 text-text-disabled">
        <Text variant="heading-h2" aria-hidden="true">?</Text>
        <SeatIcon size="md" />
      </div>

      <Text variant="body-sm-emphasis" tone="disabled" className="mt-14">
        Não há um mapa configurado
        <br />
        para esta turma
      </Text>

      <Button iconLeft="map" className="mt-14" onClick={onCreateMap}>
        Criar Mapa de Sala
      </Button>
    </div>
  )
}