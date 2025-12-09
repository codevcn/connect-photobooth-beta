import { hardCodedLayoutData } from '@/configs/print-layout/print-layout-data'
import { TPrintedImageVisualState } from '@/utils/types/global'
import { TPrintLayout } from '@/utils/types/print-layout'
import { create } from 'zustand'

type TLayoutStore = {
  pickedLayout: TPrintLayout | null
  allLayouts: TPrintLayout[]

  pickLayout: (layout: TPrintLayout) => void
  unpickLayout: () => void
  setAllLayouts: (layouts: TPrintLayout[]) => void
  updateLayoutElements: (layoutId: string, elements: TPrintedImageVisualState[]) => void
  resetData: () => void
}

export const useLayoutStore = create<TLayoutStore>((set, get) => ({
  pickedLayout: null,
  allLayouts: hardCodedLayoutData() || [],

  resetData: () => {
    set({ pickedLayout: null, allLayouts: hardCodedLayoutData() || [] })
  },
  unpickLayout: () => set({ pickedLayout: null }),
  pickLayout: (layout: TPrintLayout) => set({ pickedLayout: layout }),
  setAllLayouts: (layouts: TPrintLayout[]) => set({ allLayouts: layouts }),
  updateLayoutElements: (layoutId: string, elements: TPrintedImageVisualState[]) => {
    const { allLayouts } = get()
    const updatedLayouts = allLayouts.map((layout) =>
      layout.id === layoutId ? { ...layout, printedImageElements: elements } : layout
    )
    set({ allLayouts: updatedLayouts })
  },
}))
