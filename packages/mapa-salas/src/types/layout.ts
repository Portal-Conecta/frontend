import type { LayoutPositionType } from './roomMap'

// ── Posição no grid do layout template ──────────────────────────────────────
// Espelha LayoutPositionItemResponse (sem id, sem layoutTemplateId).

export type LayoutPositionItem = {
  positionX: number
  positionY: number
  type: LayoutPositionType
}

// ── Template com posições ──────────────────────────────────────────────────
// Espelha LayoutTemplateWithPositionsResponse.

export type LayoutTemplateWithPositions = {
  layoutTemplateId: string
  dimensionX: number
  dimensionY: number
  positions: LayoutPositionItem[]
}

// ── Posição com id (usado em outros contextos) ────────────────────────────
// Espelha LayoutPositionResponse.

export type LayoutPosition = {
  id: string
  layoutTemplateId: string
  positionX: number
  positionY: number
  type: LayoutPositionType
}

// ── Vinculação sala ↔ layout ───────────────────────────────────────────────
// Espelha RoomLayoutResponse.

export type RoomLayout = {
  id: string
  roomId: string
  layoutTemplateId: string
  createdAt: string
}