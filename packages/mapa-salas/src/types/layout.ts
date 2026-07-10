import type { LayoutPositionType } from './roomMap'

export type LayoutPositionItem = {
  positionX: number
  positionY: number
  type: LayoutPositionType
}

export type LayoutTemplateWithPositions = {
  layoutTemplateId: string
  dimensionX: number
  dimensionY: number
  positions: LayoutPositionItem[]
}

export type LayoutPosition = {
  id: string
  layoutTemplateId: string
  positionX: number
  positionY: number
  type: LayoutPositionType
}

export type RoomLayout = {
  id: string
  roomId: string
  layoutTemplateId: string
  createdAt: string
}