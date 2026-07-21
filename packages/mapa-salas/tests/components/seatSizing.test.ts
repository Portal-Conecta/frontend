import { describe, expect, it } from 'vitest'

import {
  buildFluidWidthClamp,
  MAP_GRID_MIN_SEAT_WIDTH,
  SEAT_ICON_DESKTOP_WIDTH,
  SEAT_ICON_FLUID_WIDTH,
  SEAT_SIZING_LG_PX,
} from '../../src/components/seatSizing'

describe('buildFluidWidthClamp', () => {
  it('monta clamp com min, slope linear e max no intervalo de viewport', () => {
    expect(buildFluidWidthClamp(48, 99, 375, 1024)).toBe(
      'clamp(48px, calc(48px + 51 * (100vw - 375px) / 649), 99px)',
    )
  })

  it('no teto de viewport (= lg) o valor máximo do clamp é o tamanho desktop', () => {
    // Em 1024px: 48 + 51 * (1024-375) / (1024-375) = 99 — desktop pleno.
    expect(SEAT_SIZING_LG_PX).toBe(1024)
    expect(SEAT_ICON_FLUID_WIDTH).toContain(`${SEAT_ICON_DESKTOP_WIDTH}px`)
    expect(SEAT_ICON_FLUID_WIDTH).toMatch(/clamp\(48px,.+, 99px\)/)
  })

  it('piso de coluna é o ícone + padding do SeatCard (16px)', () => {
    expect(MAP_GRID_MIN_SEAT_WIDTH).toBe(
      buildFluidWidthClamp(48 + 16, SEAT_ICON_DESKTOP_WIDTH + 16),
    )
  })
})
