import { TPrintedImageVisualState } from './global'

export type TLayoutType =
  | 'full'
  | 'half-width'
  | 'half-height'
  | '3-left'
  | '3-right'
  | '3-top'
  | '3-bottom'
  | '4-square'
  | '4-horizon'
  | '4-vertical'

export type TLayoutSlotConfig = {
  containerWidth: number // Tỷ lệ width của slot so với print area (0-1)
  containerHeight: number // Tỷ lệ height của slot so với print area (0-1)
}

export type TPrintLayout = {
  id: string
  name: string
  layoutType: TLayoutType
  printedImageElements: TPrintedImageVisualState[]
  slotConfigs: TLayoutSlotConfig[]
}
