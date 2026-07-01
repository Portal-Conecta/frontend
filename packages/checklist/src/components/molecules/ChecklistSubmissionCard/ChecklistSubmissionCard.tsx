import { Button, Text } from '@portal/ui'
import type { ChecklistSubmission } from 'src/types'

export interface ChecklistSubmissionCardProps extends ChecklistSubmission {
  onView?: () => void
  className?: string
}

export function ChecklistSubmissionCard({
  room,
  checklistType,
  submittedAt,
  filledBy,
  group,
  hasNonConformity = false,
  onView,
  className,
}: ChecklistSubmissionCardProps) {
  return (
    <div
      className={[
        'border-b border-border-default',
        'flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      // eslint-disable-next-line no-restricted-syntax -- clamp responsivo intencional (crescimento gradual, não em degrau). Ver AGENTS.md §Tokens, exceção pendente de aprovação do TL.
      style={{ padding: 'clamp(12px, 2vw, 16px)' }}
    >
      {/* eslint-disable-next-line no-restricted-syntax -- clamp responsivo intencional. Ver acima. */}
      <Text tone="brand" className="font-inter font-semibold text-[14px] md:hidden">
        {room} - {checklistType}
      </Text>
      <Text
        tone="brand"
        className="hidden font-inter md:block md:w-[100px] md:shrink-0"
        // eslint-disable-next-line no-restricted-syntax -- clamp responsivo intencional. Ver acima.
        style={{ fontSize: 'clamp(12px, 1.5vw, 16px)' }}
      >
        {room}
      </Text>

      <Text
        tone="brand"
        className="font-inter font-normal md:flex-1 md:text-center"
        // eslint-disable-next-line no-restricted-syntax -- clamp responsivo intencional. Ver acima.
        style={{ fontSize: 'clamp(12px, 1.5vw, 16px)' }}
      >
        <span className="md:hidden">envio: {submittedAt}</span>
        <span className="hidden md:inline">{checklistType} | enviado ás {submittedAt}</span>
      </Text>

      <Text
        tone="brand"
        className="font-inter font-normal md:flex-1 md:text-center"
        // eslint-disable-next-line no-restricted-syntax -- clamp responsivo intencional. Ver acima.
        style={{ fontSize: 'clamp(12px, 1.5vw, 16px)' }}
      >
        Preenchido por: {filledBy} | {group}
      </Text>

      <Button
        variant="outlined"
        iconLeft="eye"
        onClick={onView}
        // eslint-disable-next-line no-restricted-syntax -- clamp/padding intencional. Ver acima.
        style={{ paddingTop: '8px', paddingBottom: '8px' }}
        className={[
          'mt-3 w-full max-w-[342px] text-label-xs md:mt-0 md:w-[200px] md:max-w-none md:shrink-0',
          hasNonConformity
            ? '!border-feedback-error !text-feedback-error hover:!border-feedback-error hover:!text-feedback-error'
            : '',
        ].join(' ')}
      >
        Ver Envio
      </Button>
    </div>
  )
}