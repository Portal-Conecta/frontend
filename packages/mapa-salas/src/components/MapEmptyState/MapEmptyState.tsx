/**
 * MapEmptyState — estado vazio exibido quando não há mapa configurado para a
 * sala e turma selecionadas.
 *
 * A decisão de quando renderizar este componente é do PageMapaSalas — este
 * componente não sabe nada sobre esse fluxo, apenas propaga o clique do botão
 * via `onCreateMap`. Zero lógica de negócio.
 *
 * Recebe `onCreateMap` (função) via prop — assim como StudentSidebar e
 * MapGrid, só funciona sob boundary client (o componente pai que passa o
 * handler precisa de 'use client'; este componente em si permanece Server
 * Component, pois não usa hooks nem define handler próprio).
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
    'flex flex-col items-center justify-center p-20 text-center',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <Text as="h2" variant="heading-h2">Mapa não encontrado</Text>

      {/* "?" como Text (não SVG): frame real do Figma mostra o "?" empilhado
          acima do SeatIcon, não sobreposto — diverge do texto da issue #136,
          que pedia SVG absoluto. tone="disabled" confirmado direto contra o
          frame (print anexado no PR) — o cinza do Figma é o de "controle
          indisponível", não apenas um paralelo com o SeatCard (que usa
          secondary em outro estado e não serve de justificativa por si só).
          O ícone herda a cor via currentColor (SeatIcon não tem prop tone).

          Espaçamento assimétrico CONFIRMADO contra o frame (ver screenshots
          no PR): 56px entre título e bloco ?/ícone, 112px entre o bloco e o
          subtítulo, 56px entre subtítulo e botão. O respiro maior no meio é
          intencional no design, não um mb-14 sobrando. Implementado via
          mt-14/mb-14 nos filhos (sem gap no container) — como são itens
          flex, as margens não colapsam, então mb-14 do bloco + mt-14 do
          subtítulo somam os 112px esperados. */}
      <Text as="div" tone="disabled" className="flex flex-col items-center mt-14 mb-14">
        <Text variant="heading-h2" aria-hidden="true" tone="disabled">?</Text>
        <SeatIcon size="md" />
      </Text>

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