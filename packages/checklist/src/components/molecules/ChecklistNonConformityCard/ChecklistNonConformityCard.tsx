'use client'

import { Button, Icon, Text } from '@portal/ui'
import { useId, useState } from 'react'

export interface ChecklistNonConformityCardProps {
  room: string
  category: string
  checklistType: string
  submittedDate: string
  submittedTime: string
  filledBy: string
  group: string
  nonConformity: string
  defaultOpen?: boolean
  onToggle?: (open: boolean) => void
  className?: string
}

export function ChecklistNonConformityCard({
  room,
  category,
  checklistType,
  submittedDate,
  submittedTime,
  filledBy,
  group,
  nonConformity,
  defaultOpen = false,
  onToggle,
  className,
}: ChecklistNonConformityCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev
      onToggle?.(next)
      return next
    })
  }

  return (
    <div className={['border-b border-border-default', className].filter(Boolean).join(' ')}>
      <div className="flex flex-col gap-4 p-4 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col lg:hidden">
          <Text variant="label-sm" tone="brand" className="mb-4 md:text-label-md">
            {category}
          </Text>

          <div className="flex flex-col gap-1">
            <Text variant="label-sm" tone="brand" className="md:text-label-md">
              {room} - {checklistType}
            </Text>

            <Text variant="label-xs" tone="secondary" className="md:text-label-sm">
              envio: {submittedDate} às {submittedTime}
            </Text>

            <Text variant="label-xs" tone="secondary" className="md:text-label-sm">
              Preenchido por: {filledBy} | {group}
            </Text>
          </div>
        </div>

        <Text variant="label-md" tone="brand" className="hidden lg:block">
          {room}
        </Text>

        <Text variant="label-md" tone="brand" className="hidden lg:block">
          {category}
        </Text>

        <Text variant="label-md" tone="brand" className="hidden lg:block">
          {checklistType} | enviado às {submittedTime}
        </Text>

        <Text variant="label-md" tone="brand" className="hidden lg:block">
          Preenchido por: {filledBy} | {group}
        </Text>

        <Button
          variant="outlined"
          size="sm"
          iconLeft={open ? 'chevron-up' : 'chevron-down'}
          onClick={toggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="w-full lg:w-56 lg:shrink-0"
        >
          ver não conformidade
        </Button>
      </div>

      <div
        className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-4 pb-4">
            <div
              id={panelId}
              role="region"
              aria-label="Não conformidade"
              className="rounded-md border-sm border-border-default bg-background-default p-3"
            >
              <Text variant="label-sm" tone="brand">
                {nonConformity}
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}