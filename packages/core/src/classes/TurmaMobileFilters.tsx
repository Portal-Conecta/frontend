'use client'

/**
 * TurmaMobileFilters — o botão "Filtros" do mobile + o bottom sheet que ele
 * abre. Client component: detém o estado `open`. Some no desktop (`lg:hidden`),
 * onde os filtros vivem na coluna lateral.
 */
import { useState } from 'react'

import { Button } from '@portal/ui'

import { TurmaFiltersSheet } from './TurmaFiltersSheet'

export function TurmaMobileFilters() {
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

      <TurmaFiltersSheet open={open} onClose={() => setOpen(false)} />
    </>
  )
}
