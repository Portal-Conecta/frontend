import { Icon, Text, spacing } from '@portal/ui'
import type { CSSProperties } from 'react'

export interface ChecklistItemResultProps {
  title: string
  description?: string
  status: 'conforme' | 'nao-conforme'
  observation?: string
  className?: string
}

/**
 * Chip de status — mesma caixa nos dois estados (tokens DS):
 * width 36 = 144px · height 10 = 40px · px 3 (12px) · py 1 (4px) · gap 1 (4px)
 */
const chipBoxStyle: CSSProperties = {
  boxSizing: 'border-box',
  width: spacing[36],
  minWidth: spacing[36],
  maxWidth: spacing[36],
  height: spacing[10],
  minHeight: spacing[10],
  maxHeight: spacing[10],
  flex: `0 0 ${spacing[36]}`,
}

const statusChipBase =
  'inline-flex items-center justify-center gap-1 ' +
  'rounded-md border-sm px-3 py-1 ' +
  'font-inter text-label-xs leading-none whitespace-nowrap overflow-hidden'

export function ChecklistItemResult({
  title,
  description,
  status,
  observation,
  className,
}: ChecklistItemResultProps) {
  const isConforme = status === 'conforme'
  const statusLabel = isConforme ? 'Conforme' : 'Não Conforme'

  return (
    <div className={['border-t border-border-default py-3', className].filter(Boolean).join(' ')}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Text variant="label-sm" tone="brand" className="md:text-label-md">
            {title}
          </Text>

          {isConforme && description && (
            <Text variant="label-xs" tone="secondary" className="break-words md:text-label-sm">
              {description}
            </Text>
          )}
        </div>

        <div
          className={[
            statusChipBase,
            isConforme
              ? 'border-feedback-success text-feedback-success'
              : 'border-feedback-error text-feedback-error',
          ].join(' ')}
          style={chipBoxStyle}
          aria-label={statusLabel}
        >
          <Icon
            name={isConforme ? 'check-check' : 'x'}
            size="sm"
            decorative
            className="size-4 shrink-0"
          />
          <span className="flex-1 text-center leading-none whitespace-nowrap">{statusLabel}</span>
        </div>
      </div>

      {!isConforme && observation && (
        <div className="mt-3 rounded-md border-sm border-border-default bg-background-surface px-4 py-3">
          <Text variant="label-sm" tone="brand" className="break-words">
            {observation}
          </Text>
        </div>
      )}
    </div>
  )
}
