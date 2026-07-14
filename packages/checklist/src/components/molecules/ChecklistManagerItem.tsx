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
      <div className="flex w-full min-w-0 flex-col gap-2 sm:max-w-3xl">
        <Text variant="label-sm" tone="brand" className="md:text-label-md">
          {title}
        </Text>
        {description && (
          <Text variant="label-xs" tone="secondary" className="break-words md:text-label-sm">
            {description}
          </Text>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <Button
          variant="outlined"
          tone="brand"
          size="sm"
          iconLeft="square-pen"
          onClick={onEdit}
          aria-label="Editar item"
        >
          <span className="hidden sm:inline">Editar</span>
        </Button>

        <Button
          variant="outlined"
          tone="negative"
          size="sm"
          iconLeft="trash-2"
          onClick={onDelete}
          aria-label="Excluir item"
        >
          <span className="hidden sm:inline">Excluir Item</span>
        </Button>
      </div>
    </div>
  )
}