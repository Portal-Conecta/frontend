'use client'

/**
 * TurmaMobileFilters — o botão "Filtros" do mobile + o bottom sheet que ele
 * abre. Client component: detém o estado `open`. Some no desktop (`lg:hidden`),
 * onde os filtros vivem na coluna lateral.
 */
import { useState } from 'react'

import { Button } from '@portal/ui'

import { TurmaFiltersSheet } from './TurmaFiltersSheet'
import type { TurmaFilters } from './turmaRows'

export interface TurmaMobileFiltersProps {
  courseOptions?: string[] | undefined
  shiftOptions?: string[] | undefined
  onApply?: ((filters: TurmaFilters) => void) | undefined
  onReset?: (() => void) | undefined
}

export function TurmaMobileFilters({
  courseOptions,
  shiftOptions,
  onApply,
  onReset,
}: TurmaMobileFiltersProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        iconLeft="funnel"
        variant="outlined"
        size='xs'
        className="shrink-0 lg:hidden"
        onClick={() => setOpen(true)}
      >
        Filtros
      </Button>

      <TurmaFiltersSheet
        open={open}
        onClose={() => setOpen(false)}
        courseOptions={courseOptions}
        shiftOptions={shiftOptions}
        onApply={onApply}
        onReset={onReset}
      />
    </>
  )
}
