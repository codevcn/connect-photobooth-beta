import { TPrintedImage, TPrintTemplate } from '@/utils/types/global'
import { cn } from '@/configs/ui/tailwind-utils'
import { useTemplateStore } from '@/stores/ui/template.store'
import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import type React from 'react'
import { styleToFramesDisplayerByTemplateType } from '@/configs/print-template/templates-helpers'
import { useEffect, useMemo, useRef, useState } from 'react'
import { assignMockFrameSizeToTemplate, initFramePlacedImageByPrintedImage } from '../../helpers'
import { useEditModeStore } from '@/stores/ui/edit-mode.store'
import { useEditedElementStore } from '@/stores/element/element.store'
import { useLayoutStore } from '@/stores/ui/print-layout.store'
import { TPrintLayout } from '@/utils/types/print-layout'
import { PreviewImage } from './PreviewImage'
import { buildLayoutByLayoutType } from './builder'
import { createInitialConstants } from '@/utils/contants'

type TLayoutsPickerProps = {
  printedImages: TPrintedImage[]
}

export const LayoutsPicker = ({ printedImages }: TLayoutsPickerProps) => {
  const allLayouts = useLayoutStore((s) => s.allLayouts)
  const setAllLayouts = useLayoutStore((s) => s.setAllLayouts)

  // State chỉ để render UI, không sync ngược lại store
  const [layoutsWithElements, setLayoutsWithElements] = useState<TPrintLayout[]>([])
  const containerRef = useRef<HTMLDivElement | null>(null)
  const isInitializedRef = useRef(false)

  console.log('>>> [pick] layoutsWithElements:', layoutsWithElements)

  const handlePickTemplate = (layout: TPrintLayout) => {
    useEditedElementStore.getState().cancelSelectingElement()
    useLayoutStore.getState().pickLayout(layout)
  }

  // Bước 1: Khi allLayouts thay đổi → tạo layout preview (chưa có elements)
  useEffect(() => {
    if (allLayouts.length === 0) return

    // Clone layouts từ store (chưa có printedImageElements)
    const initialLayouts = allLayouts.map((layout) => ({
      ...layout,
      printedImageElements: [], // Reset để render placeholder trước
    }))
    setLayoutsWithElements(initialLayouts)
    isInitializedRef.current = false // Đánh dấu cần build lại elements
  }, [allLayouts])

  // Bước 2: Sau khi DOM render xong → build elements cho mỗi layout
  useEffect(() => {
    // Chỉ chạy khi:
    // 1. Có layouts để render
    // 2. Chưa initialized hoặc printedImages thay đổi
    if (layoutsWithElements.length === 0) return
    if (isInitializedRef.current && printedImages.length === 0) return

    // Đợi DOM render xong
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const layoutElements = containerRef.current?.querySelectorAll<HTMLElement>(
          '.NAME-layout-preview-item'
        )

        if (!layoutElements || layoutElements.length === 0) return

        const updatedLayouts: TPrintLayout[] = []

        layoutElements.forEach((layoutElement, index) => {
          const layoutData = allLayouts[index]
          if (!layoutData) return

          try {
            const builtLayout = buildLayoutByLayoutType(
              layoutData.layoutType,
              layoutElement,
              printedImages,
              createInitialConstants('LAYOUT_PADDING')
            )

            updatedLayouts.push({
              ...layoutData,
              printedImageElements: builtLayout.elements,
            })
          } catch (error) {
            console.error(`Error building layout ${layoutData.id}:`, error)
            updatedLayouts.push({
              ...layoutData,
              printedImageElements: [],
            })
          }
        })

        // Chỉ update local state, KHÔNG gọi setAllLayouts để tránh loop
        setLayoutsWithElements(updatedLayouts)
        isInitializedRef.current = true
      })
    })
  }, [layoutsWithElements.length, printedImages, allLayouts])

  return (
    <div ref={containerRef} className="w-full">
      <h3 className="5xl:text-[1.5em] smd:text-base text-xs mb-1 font-bold text-gray-800">
        Chọn mẫu in
      </h3>
      <div className="smd:grid-cols-3 smd:overflow-x-hidden smd:grid-flow-row grid-rows-1 grid-flow-col overflow-x-auto grid-flow grid gap-2 w-full gallery-scroll">
        {/* Bước 1: Render placeholder cho mỗi layout */}
        {allLayouts.map((layout, index) => {
          const layoutWithElements = layoutsWithElements[index]
          return (
            <div
              key={layout.id}
              onClick={() => layoutWithElements && handlePickTemplate(layoutWithElements)}
              className="relative flex items-center justify-center aspect-square min-h-16 border border-gray-300 rounded bg-white mobile-touch cursor-pointer transition"
            >
              <div className="NAME-layout-preview-item absolute top-0 left-0 h-full w-full">
                {/* Bước 2: Render ảnh khi đã có elements */}
                {layoutWithElements?.printedImageElements?.map((printedImageVisualState) => (
                  <PreviewImage
                    key={printedImageVisualState.id}
                    printedImageVisualState={printedImageVisualState}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
