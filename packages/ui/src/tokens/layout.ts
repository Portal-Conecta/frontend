/**
 * Constantes de layout do shell (AppLayout).
 *
 * Diferente dos demais tokens, NÃO vêm do pipeline do Figma: são o contrato de
 * dimensão do rail da Sidebar, compartilhado pelos organismos que animam em
 * lockstep a partir do estado `expanded` (Sidebar, AppHeader, AppFooter).
 *
 * Em px — consumidas via `style={{ width }}`, por isso ficam fora da escala de
 * spacing do Tailwind. 92px = rail colapsado · 254px = rail expandido.
 *
 * Morar em `tokens/` (e não num organismo) evita dependência lateral entre
 * organismos: todos importam para baixo, da camada de tokens.
 */

export const SIDEBAR_WIDTH_COLLAPSED = 92
export const SIDEBAR_WIDTH_EXPANDED = 248
