'use client'

/**
 * Card de usuário reutilizável na tela de gestão de turma (#457): avatar,
 * nome e uma ação opcional — associar (`+` verde), desassociar (`×` vermelho)
 * ou nenhuma (`none`, só exibição). Consumido por `TurmaMembersList` (remove)
 * e `TurmaMemberSearchPanel` (add), que antes duplicavam essa mesma marcação.
 */
import { Avatar, Button, ListItem, Text } from '@portal/ui'

export type AssociateUsersCardVariant = 'add' | 'remove' | 'none'

export interface AssociateUsersCardProps {
  name: string
  variant: AssociateUsersCardVariant
  onAction?: () => void
  disabled?: boolean
}

export function AssociateUsersCard({ name, variant, onAction, disabled = false }: AssociateUsersCardProps) {
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
          onClick={onAction}
        />
      )}
    </ListItem>
  )
}

export default AssociateUsersCard
