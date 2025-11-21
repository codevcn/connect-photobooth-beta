import {
  TBaseProduct,
  TPrintAreaInfo,
  TPrintAreaShapeType,
  TPrintedImage,
  TPrintTemplate,
  TSizeInfo,
} from '@/utils/types/global'
import { PrintAreaOverlay } from './live-preview/PrintAreaOverlay'
import { usePrintArea } from '@/hooks/use-print-area'
import { hardCodedPrintTemplates } from '@/configs/data/print-template'
import { diffPrintedImageOnRectType, matchPrintedImageToRectType } from '@/utils/helpers'
import { getInitialContants } from '@/utils/contants'
import { usePrintedImageStore } from '@/stores/printed-image/printed-image.store'
import { useEffect } from 'react'

const assignFallbackTemplateToPrintArea = (): TPrintTemplate => {
  return hardCodedPrintTemplates('1-square')
}

const handleFallbackTemplate = (
  templates: TPrintTemplate,
  printedImage: TPrintedImage
): TPrintTemplate => {
  for (const frame of templates.frames) {
    frame.placedImage = {
      id: printedImage.id,
      imgURL: printedImage.url,
      placementState: {
        frameIndex: frame.index,
        objectFit: getInitialContants('PLACED_IMG_OBJECT_FIT'),
        squareRotation: getInitialContants('PLACED_IMG_SQUARE_ROTATION'),
        zoom: getInitialContants('PLACED_IMG_ZOOM'),
      },
    }
  }
  return templates
}

const assignTemplatesToPrintArea = (printAreaSize: TSizeInfo): TPrintTemplate[] => {
  const { width, height } = printAreaSize
  const template2Vertical = hardCodedPrintTemplates('2-vertical') // ưu tiên: ảnh vuông, ảnh dọc
  for (const frame of template2Vertical.frames) {
    frame.width = width / 2
    frame.height = height
  }
  const template2Horizon = hardCodedPrintTemplates('2-horizon') // ưu tiên: ảnh vuông
  for (const frame of template2Horizon.frames) {
    frame.width = width
    frame.height = height / 2
  }
  const template1Square = hardCodedPrintTemplates('1-square') // ưu tiên: ảnh dọc, ảnh vuông
  for (const frame of template1Square.frames) {
    frame.width = width
    frame.height = height
  }
  return [template2Vertical, template2Horizon, template1Square]
}

const getTheBestTemplateForPrintedImages = (
  printAreaSize: TSizeInfo,
  printedImages: TPrintedImage[]
): TPrintTemplate => {
  const templates = assignTemplatesToPrintArea(printAreaSize)
  let foundTemplate: TPrintTemplate | null = null
  for (const image of printedImages) {
    // ảnh bự nhất đặt ở đầu
    let frameDimensionPoint: number = 0
    for (const template of templates) {
      let point = 0
      for (const frame of template.frames) {
        const match = matchPrintedImageToRectType(frame.frameRectType, {
          height: image.height,
          width: image.width,
        })
        if (match) {
          frame.placedImage = {
            id: image.id,
            imgURL: image.url,
            placementState: {
              frameIndex: frame.index,
              objectFit: getInitialContants('PLACED_IMG_OBJECT_FIT'),
              squareRotation: getInitialContants('PLACED_IMG_SQUARE_ROTATION'),
              zoom: getInitialContants('PLACED_IMG_ZOOM'),
            },
          }
          point += frame.frameRectType === 'horizontal' ? frame.width : frame.height
        }
      }
      if (point > frameDimensionPoint) {
        frameDimensionPoint = point
        foundTemplate = template
      }
    }
    if (foundTemplate) {
      return foundTemplate
    }
  }
  // trả về template đầu tiên nếu không tìm thấy cái nào phù hợp
  return handleFallbackTemplate(assignFallbackTemplateToPrintArea(), printedImages[0])
}

type TProductProps = {
  product: TBaseProduct
  printAreaInfo: TPrintAreaInfo
  printedImages: TPrintedImage[]
  onPickProduct: (product: TBaseProduct) => void
}

const Product = ({ product, printAreaInfo, printedImages, onPickProduct }: TProductProps) => {
  const printArea = printAreaInfo.area
  const {
    printAreaRef,
    containerElementRef: printAreaContainerRef,
    initializePrintArea,
  } = usePrintArea()

  // Cập nhật vùng in khi sản phẩm thay đổi
  useEffect(() => {
    if (printAreaContainerRef.current) {
      const imageElement = printAreaContainerRef.current.querySelector(
        '.NAME-product-image'
      ) as HTMLImageElement

      if (!imageElement) return

      const updatePrintAreaWhenImageLoaded = () => {
        if (printAreaContainerRef.current) {
          initializePrintArea(printAreaInfo.area, printAreaContainerRef.current)
        }
      }

      // Nếu ảnh đã load xong
      if (imageElement.complete && imageElement.naturalWidth > 0) {
        // Delay nhỏ để đảm bảo DOM đã render xong
        const timeoutId = setTimeout(updatePrintAreaWhenImageLoaded, 50)
        return () => clearTimeout(timeoutId)
      } else {
        // Nếu ảnh chưa load, đợi event load
        imageElement.addEventListener('load', updatePrintAreaWhenImageLoaded)
        return () => imageElement.removeEventListener('load', updatePrintAreaWhenImageLoaded)
      }
    }
  }, [initializePrintArea, printAreaInfo])

  // Theo dõi resize của container
  useEffect(() => {
    if (!printAreaContainerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          const imageElement = printAreaContainerRef.current?.querySelector(
            '.NAME-product-image'
          ) as HTMLImageElement

          if (imageElement && imageElement.complete && imageElement.naturalWidth > 0) {
            setTimeout(() => {
              if (printAreaContainerRef.current) {
                initializePrintArea(printAreaInfo.area, printAreaContainerRef.current)
              }
            }, 100)
          }
        }
      }
    })

    resizeObserver.observe(printAreaContainerRef.current)
    return () => resizeObserver.disconnect()
  }, [initializePrintArea, printAreaInfo.area])

  return (
    <div
      key={product.id}
      ref={printAreaContainerRef}
      className={`NAME-product w-full aspect-square relative rounded-xl transition duration-200 border border-gray-200`}
      data-url={product.url}
      onClick={() => onPickProduct(product)}
    >
      <img
        src={product.url || '/placeholder.svg'}
        alt="Overlay"
        className="NAME-product-image min-h-full max-h-full w-full h-full object-contain rounded-xl"
      />
      <PrintAreaOverlay
        printTemplate={getTheBestTemplateForPrintedImages(
          {
            height: printArea.printH,
            width: printArea.printW,
          },
          printedImages
        )}
        printAreaRef={printAreaRef}
        isOutOfBounds={false}
      />
    </div>
  )
}

type TProductGalleryProps = {
  products: TBaseProduct[]
  printedImages: TPrintedImage[]
  onPickProduct: (product: TBaseProduct) => void
}

export const ProductGallery = ({ products, onPickProduct }: TProductGalleryProps) => {
  const { printedImages } = usePrintedImageStore()

  return (
    <div className="md:h-screen h-fit flex flex-col bg-white py-3 border border-gray-200">
      <h2 className="text-base w-full text-center font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
        Gian hàng sản phẩm
      </h2>
      <div className="overflow-y-auto px-1.5">
        <div className="flex md:flex-col md:items-center gap-3 overflow-x-scroll p-2 pt-3 md:overflow-y-auto md:overflow-x-clip h-fit md:max-h-full spmd:max-h-full gallery-scroll">
          {products &&
            products.length > 0 &&
            products.map((product) => {
              return (
                <Product
                  key={product.id}
                  product={product}
                  printAreaInfo={product.printAreaList[0]}
                  printedImages={printedImages}
                  onPickProduct={onPickProduct}
                />
              )
            })}
        </div>
      </div>
    </div>
  )
}
