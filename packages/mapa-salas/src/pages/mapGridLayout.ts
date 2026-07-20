/**
 * Gap da grade de assentos, compartilhado entre a grade real (`MapGrid`) e o
 * skeleton (`MapGridSkeleton`) para que fiquem alinhados no swap — nenhum dos
 * dois define gap próprio (dívida documentada nos dois componentes).
 * Reduzido de `gap-x-8 gap-y-6` (32px/24px): com o piso de coluna hoje fluido
 * (`MAP_GRID_MIN_SEAT_WIDTH`, ver `components/seatSizing.ts`) o respiro fixo
 * ficava desproporcional ao ícone em telas menores, onde o ícone encolhe mas
 * o gap não. Aproximação do respiro do Figma; ajustável num follow-up de
 * fidelidade visual.
 */
export const MAP_GRID_GAP = 'gap-x-4 gap-y-3'
