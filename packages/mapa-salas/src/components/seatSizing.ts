/**
 * Tamanho do `SeatIcon` (e piso de coluna do `MapGrid`) por CSS `clamp()`
 * **abaixo de `lg` (1024px)**. Em `lg+` o ícone volta ao tamanho desktop fixo
 * (`md` = 99px) e a grade usa `minmax(0, 1fr)` — sem regressão visual no
 * desktop/tablet (#427).
 *
 * Entre `SEAT_ICON_VIEWPORT_MIN` (mobile) e `lg`, o ícone cresce em pequenos
 * incrementos (48px → 99px) em vez de um salto binário `sm`/`md`.
 *
 * Por largura de TELA (`100vw`), não container query: reagir ao tamanho real
 * da coluna fazia o ícone mudar entre modo visualização e edição na mesma
 * largura (a `StudentSidebar` aperta a coluna) — o produto quer tamanho
 * estável por tela.
 *
 * `MAP_GRID_MIN_SEAT_WIDTH` e `SEAT_ICON_FLUID_WIDTH` usam a mesma fórmula
 * (mesmos min/max de viewport), só com o piso deslocado pelo padding do
 * `SeatCard` — a coluna nunca fica menor do que o ícone precisa.
 */

/** Breakpoint `lg` do Tailwind — acima disso o comportamento é o desktop atual. */
export const SEAT_SIZING_LG_PX = 1024

const SEAT_ICON_MIN_WIDTH = 48
/** Mesmo valor de `seatIconSizeMap.md` — tamanho desktop pleno. */
export const SEAT_ICON_DESKTOP_WIDTH = 99

const SEAT_ICON_VIEWPORT_MIN = 375
const SEAT_ICON_VIEWPORT_MAX = SEAT_SIZING_LG_PX

/** `p-2` do `SeatCard` (8px de cada lado) — o piso de coluna precisa desse espaço além da largura do ícone. */
const SEAT_CARD_PADDING_X = 16

/**
 * Monta o `clamp()` fluido entre `minPx` e `maxPx` no intervalo de viewport.
 * Exportada pra teste — a fórmula é o contrato de #427 (mobile encolhe, `lg+`
 * já está no teto = desktop).
 */
export function buildFluidWidthClamp(
  minPx: number,
  maxPx: number,
  viewportMin: number = SEAT_ICON_VIEWPORT_MIN,
  viewportMax: number = SEAT_ICON_VIEWPORT_MAX,
): string {
  const slope = maxPx - minPx
  const viewportRange = viewportMax - viewportMin
  return `clamp(${minPx}px, calc(${minPx}px + ${slope} * (100vw - ${viewportMin}px) / ${viewportRange}), ${maxPx}px)`
}

/**
 * Largura fluida do `SeatIcon` abaixo de `lg`. Em `lg+` o consumidor trava em
 * `SEAT_ICON_DESKTOP_WIDTH` (ver `SeatCard`).
 */
export const SEAT_ICON_FLUID_WIDTH = buildFluidWidthClamp(
  SEAT_ICON_MIN_WIDTH,
  SEAT_ICON_DESKTOP_WIDTH,
)

/** Piso de coluna do `MapGrid` abaixo de `lg` — ícone fluido + padding do `SeatCard`. */
export const MAP_GRID_MIN_SEAT_WIDTH = buildFluidWidthClamp(
  SEAT_ICON_MIN_WIDTH + SEAT_CARD_PADDING_X,
  SEAT_ICON_DESKTOP_WIDTH + SEAT_CARD_PADDING_X,
)
