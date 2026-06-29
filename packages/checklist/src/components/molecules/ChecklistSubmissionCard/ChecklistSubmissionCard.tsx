'use client'

import { Button, Text } from '@portal/ui'

export interface ChecklistSubmissionCardProps {
  room: string
  checklistType: string
  submittedAt: string
  filledBy: string
  group: string
  hasNonConformity?: boolean
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
      style={{ padding: 'clamp(12px, 2vw, 16px)' }}
    >
      <Text
        tone="brand"
        className="font-inter font-semibold text-[14px] md:hidden"
      >
        {room} - {checklistType}
      </Text>
      <Text
        tone="brand"
        className="hidden font-inter md:block md:w-[100px] md:shrink-0"
        style={{ fontSize: 'clamp(12px, 1.5vw, 16px)' }}
      >
        {room}
      </Text>

      <Text
        tone="brand"
        className="font-inter font-normal md:flex-1 md:text-center"
        style={{ fontSize: 'clamp(12px, 1.5vw, 16px)' }}
      >
        <span className="md:hidden">envio: {submittedAt}</span>
        <span className="hidden md:inline">{checklistType} | enviado ás {submittedAt}</span>
      </Text>

      <Text
        tone="brand"
        className="font-inter font-normal md:flex-1 md:text-center"
        style={{ fontSize: 'clamp(12px, 1.5vw, 16px)' }}
      >
        Preenchido por: {filledBy} | {group}
      </Text>

      <Button
        variant="outlined"
        iconLeft="eye"
        onClick={onView}
        style={{ paddingTop: '8px', paddingBottom: '8px' }}
        className={[
          'mt-3 w-full max-w-[342px] text-[12px] font-normal md:mt-0 md:w-[200px] md:max-w-none md:shrink-0',
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