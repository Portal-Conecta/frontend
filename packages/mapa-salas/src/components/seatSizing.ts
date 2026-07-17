/**
 * Tamanho do `SeatIcon` (e piso de coluna do `MapGrid`) por CSS `clamp()`
 * fluido, em vez de um salto binário entre dois tamanhos fixos (`sm` 48px /
 * `md` 99px, tentativa anterior com breakpoints Tailwind `md`/`lg`/1500px):
 * o ícone cresce em pequenos incrementos conforme a tela cresce, entre
 * `SEAT_ICON_VIEWPORT_MIN` (mobile) e `SEAT_ICON_VIEWPORT_MAX` (tamanho
 * desktop pleno — mesmo breakpoint de 1500px da decisão de produto anterior).
 *
 * Por largura de TELA (`100vw`), não container query: reagir ao tamanho real
 * da coluna renderizada fazia o ícone mudar de tamanho entre modo
 * visualização e edição na mesma largura de tela (a `StudentSidebar` do modo
 * edição aperta a coluna) — tentativa descartada, o produto quer tamanho
 * estável por tela, igual nos dois modos.
 *
 * `MAP_GRID_MIN_SEAT_WIDTH` e `SEAT_ICON_FLUID_WIDTH` usam a mesma fórmula
 * (mesmos `SEAT_ICON_VIEWPORT_MIN/MAX`), só com min/max deslocados pelo
 * padding do `SeatCard` — o piso da coluna sempre acompanha o ícone mais o
 * espaço que ele precisa, nunca corta.
 */

const SEAT_ICON_MIN_WIDTH = 48
const SEAT_ICON_MAX_WIDTH = 99
const SEAT_ICON_VIEWPORT_MIN = 375
const SEAT_ICON_VIEWPORT_MAX = 1500

/** `p-2` do `SeatCard` (8px de cada lado) — o piso de coluna precisa desse espaço além da largura do ícone. */
const SEAT_CARD_PADDING_X = 16

function fluidWidth(minPx: number, maxPx: number): string {
  const slope = maxPx - minPx
  const viewportRange = SEAT_ICON_VIEWPORT_MAX - SEAT_ICON_VIEWPORT_MIN
  return `clamp(${minPx}px, calc(${minPx}px + ${slope} * (100vw - ${SEAT_ICON_VIEWPORT_MIN}px) / ${viewportRange}), ${maxPx}px)`
}

/**
 * Largura fluida do `SeatIcon` — usar em `style.width` junto com
 * `aspectRatio: '99 / 58'` (proporção do viewBox do ícone) e `height: 'auto'`,
 * em vez da prop `size` (dois valores fixos) do componente.
 */
export const SEAT_ICON_FLUID_WIDTH = fluidWidth(SEAT_ICON_MIN_WIDTH, SEAT_ICON_MAX_WIDTH)

/** Piso de largura de cada coluna do `MapGrid` — largura fluida do ícone + padding do `SeatCard`, pra nunca cortar o ícone. */
export const MAP_GRID_MIN_SEAT_WIDTH = fluidWidth(
  SEAT_ICON_MIN_WIDTH + SEAT_CARD_PADDING_X,
  SEAT_ICON_MAX_WIDTH + SEAT_CARD_PADDING_X,
)
