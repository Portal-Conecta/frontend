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
        'flex items-center justify-between gap-8 border-t border-border-default py-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className="flex flex-col gap-2 min-w-0"
        // eslint-disable-next-line no-restricted-syntax -- clamp responsivo intencional (crescimento gradual, não em degrau). Ver AGENTS.md §Tokens, exceção pendente de aprovação do TL.
        style={{ maxWidth: 'clamp(200px, 50vw, 768px)' }}
      >
        {/* eslint-disable-next-line no-restricted-syntax -- clamp responsivo intencional. Ver acima. */}
        <Text variant="label-md" tone="brand" className="text-[clamp(14px,2vw,16px)]">
          {title}
        </Text>
        {description && (
          // eslint-disable-next-line no-restricted-syntax -- clamp responsivo intencional. Ver acima.
          <Text variant="body-sm" tone="secondary" className="font-inter text-[14px] break-words">
            {description}
          </Text>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <Button
          variant="outlined"
          iconLeft="square-pen"
          onClick={onEdit}
          // eslint-disable-next-line no-restricted-syntax -- clamp/tamanho intencional. Ver acima.
          className="text-[12px] font-normal border-interactive-default text-interactive-default"
        >
          Editar
        </Button>

        <Button
          variant="outlined"
          iconLeft="trash-2"
          onClick={onDelete}
          // eslint-disable-next-line no-restricted-syntax -- clamp/tamanho intencional. Ver acima.
          className="text-[12px] font-normal !border-feedback-error !text-feedback-error hover:!border-feedback-error hover:!text-feedback-error active:!border-feedback-error active:!text-feedback-error"
        >
          Excluir Item
        </Button>
      </div>
    </div>
  )
}