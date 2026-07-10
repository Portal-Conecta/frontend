export const HUB_SHIFT = {
  FULL_AM_PM: 'FULL_AM_PM',
  FULL_PM_NT: 'FULL_PM_NT',
} as const

export type HubShift = (typeof HUB_SHIFT)[keyof typeof HUB_SHIFT]

/** Rotulos PT-BR para o enum `Shift` do core. */
export const HUB_SHIFT_LABELS: Record<HubShift, string> = {
  [HUB_SHIFT.FULL_AM_PM]: 'Manhã e tarde',
  [HUB_SHIFT.FULL_PM_NT]: 'Tarde e noite',
}
