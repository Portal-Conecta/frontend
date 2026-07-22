'use client'

/**
 * Card de usuário reutilizável na tela de gestão de turma (#457): avatar,
 * nome e uma ação opcional — associar (`+` verde), desassociar (`×` vermelho),
 * promover a representante ou apenas exibir. Consumido pelos fluxos de membros
 * e representantes, mantendo avatar, nome e ação consistentes entre as telas.
 */
import { Avatar, Button, ListItem, Text } from '@portal/ui'

export type AssociateUsersCardVariant = 'add' | 'remove' | 'promote' | 'none'

export interface AssociateUsersCardProps {
  name: string
  variant: AssociateUsersCardVariant
  onAction?: () => void
  disabled?: boolean
  loading?: boolean
}

export function AssociateUsersCard({
  name,
  variant,
  onAction,
  disabled = false,
  loading = false,
}: AssociateUsersCardProps) {
  return (
    <ListItem className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-3">
        <Avatar size="sm" />
        <Text as="span" variant="label-sm" tone="brand">
          {name}
        </Text>
      </span>
      {variant === 'add' && (
        <Button
          variant="outlined"
          tone="positive"
          icon="plus"
          aria-label={`Adicionar ${name}`}
          disabled={disabled}
          loading={loading}
          onClick={onAction}
        />
      )}
      {variant === 'remove' && (
        <Button
          variant="outlined"
          tone="negative"
          icon="x"
          aria-label={`Remover ${name}`}
          disabled={disabled}
          loading={loading}
          onClick={onAction}
        />
      )}
      {variant === 'promote' && (
        <Button
          size="xs"
          variant="outlined"
          disabled={disabled}
          loading={loading}
          onClick={onAction}
        >
          Tornar Representante
        </Button>
      )}
    </ListItem>
  )
}

export default AssociateUsersCard
