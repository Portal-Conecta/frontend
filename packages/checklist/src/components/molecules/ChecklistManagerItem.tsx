import { Button, Text } from '@portal/ui'

export interface ChecklistManagerItemProps {
  title: string
  description?: string
  onEdit: () => void
  onDelete: () => void
  className?: string
}

export function ChecklistManagerItem({
  title,
  description,
  onEdit,
  onDelete,
  className,
}: ChecklistManagerItemProps) {
  return (
    <div
      className={[
        'flex flex-col gap-4 border-t border-border-default py-3',
        'sm:flex-row sm:items-center sm:justify-between sm:gap-8',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex w-full min-w-0 flex-col gap-2 sm:max-w-[768px]">
        {/* eslint-disable-next-line no-restricted-syntax -- font-size fluido fora da escala (14px → 16px), clamp responsivo intencional. Ver AGENTS.md §Tokens, exceção pendente de aprovação do TL. */}
        <Text variant="label-md" tone="brand" className="text-[clamp(14px,2vw,16px)]">
          {title}
        </Text>
        {description && (
          // eslint-disable-next-line no-restricted-syntax -- font-size fluido fora da escala (12px → 14px), clamp responsivo intencional. Ver AGENTS.md §Tokens, exceção pendente de aprovação do TL.
          <Text variant="label-sm" tone="secondary" className="break-words text-[clamp(12px,2vw,14px)]">
            {description}
          </Text>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <Button
          variant="outlined"
          tone="brand"
          iconLeft="square-pen"
          onClick={onEdit}
          aria-label="Editar"
          // eslint-disable-next-line no-restricted-syntax -- tipografia fora da escala do Button (12px / weight 400) por spec de Design. Ver AGENTS.md §Tokens, exceção pendente de aprovação do TL.
          className="text-[12px] font-normal"
        >
          <span className="hidden sm:inline">Editar</span>
        </Button>

        <Button
          variant="outlined"
          tone="negative"
          iconLeft="trash-2"
          onClick={onDelete}
          aria-label="Excluir Item"
          // eslint-disable-next-line no-restricted-syntax -- tipografia fora da escala do Button (12px / weight 400) por spec de Design. Ver AGENTS.md §Tokens, exceção pendente de aprovação do TL.
          className="text-[12px] font-normal"
        >
          <span className="hidden sm:inline">Excluir Item</span>
        </Button>
      </div>
    </div>
  )
}