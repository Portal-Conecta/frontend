import type { SelectOption } from '@portal/ui'
import { HUB_SHIFT, HUB_SHIFT_LABELS } from '@portal/shared'

export const HUB_SHIFT_OPTIONS: SelectOption[] = Object.values(HUB_SHIFT).map((value) => ({
  value,
  label: HUB_SHIFT_LABELS[value],
}))
