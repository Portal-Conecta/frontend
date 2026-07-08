import type { SelectOption } from '@portal/ui'

import { HUB_SHIFT, type HubShift } from '../types/hub'

/** Rótulos PT-BR para o enum `Shift` do core (não há endpoint de turnos). */
export const HUB_SHIFT_LABELS: Record<HubShift, string> = {
  [HUB_SHIFT.FULL_AM_PM]: 'Manhã e tarde',
  [HUB_SHIFT.FULL_PM_NT]: 'Tarde e noite',
}

export const HUB_SHIFT_OPTIONS: SelectOption[] = Object.values(HUB_SHIFT).map((value) => ({
  value,
  label: HUB_SHIFT_LABELS[value],
}))
