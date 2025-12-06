// export const reAssignElementsByLayoutData = (
//   layout: TPrintLayout,
//   allowedPrintArea: HTMLElement,
//   printAreaPadding: number = 0
// ): TPrintedImageVisualState[] => {
//   const printAreaDimensions = getPrintAreaDimensions(allowedPrintArea, printAreaPadding)
//   const elements: TPrintedImageVisualState[] = structuredClone(layout.printedImageElements)
//   console.log('>>> [bui] elements:', elements)

//   const halfWidth = printAreaDimensions.width / 2
//   const halfHeight = printAreaDimensions.height / 2
//   const quarterWidth = printAreaDimensions.width / 4
//   const quarterHeight = printAreaDimensions.height / 4

//   // Helper function để tính lại kích thước cho element
//   const recalculateElementSize = (
//     element: TPrintedImageVisualState,
//     containerWidth: number,
//     containerHeight: number
//   ) => {
//     const imgRatio = element.width! / element.height!
//     const scaledSize = calculateScaledSize(imgRatio, containerWidth, containerHeight)
//     element.width = scaledSize.width
//     element.height = scaledSize.height
//     element.matchOrientation = scaledSize.matchOrientation
//   }

//   // Tính lại kích thước cho mỗi element dựa trên print area mới
//   switch (layout.layoutType) {
//     case 'full':
//       for (const element of elements) {
//         recalculateElementSize(element, printAreaDimensions.width, printAreaDimensions.height)
//       }
//       break

//     case 'half-width':
//       for (const element of elements) {
//         recalculateElementSize(element, halfWidth, printAreaDimensions.height)
//       }
//       break

//     case 'half-height':
//       for (const element of elements) {
//         recalculateElementSize(element, printAreaDimensions.width, halfHeight)
//       }
//       break

//     case '3-left': {
//       // 2 ảnh nhỏ bên trái (1/4) + 1 ảnh lớn bên phải (1/2 width x full height)
//       const [small1, small2, large] = elements
//       recalculateElementSize(small1, halfWidth, halfHeight)
//       recalculateElementSize(small2, halfWidth, halfHeight)
//       recalculateElementSize(large, halfWidth, printAreaDimensions.height)
//       break
//     }

//     case '3-right': {
//       // 1 ảnh lớn bên trái (1/2 width x full height) + 2 ảnh nhỏ bên phải (1/4)
//       const [large, small1, small2] = elements
//       recalculateElementSize(large, halfWidth, printAreaDimensions.height)
//       recalculateElementSize(small1, halfWidth, halfHeight)
//       recalculateElementSize(small2, halfWidth, halfHeight)
//       break
//     }

//     case '3-top': {
//       // 2 ảnh nhỏ trên (1/4) + 1 ảnh lớn dưới (full width x 1/2 height)
//       const [small1, small2, large] = elements
//       recalculateElementSize(small1, halfWidth, halfHeight)
//       recalculateElementSize(small2, halfWidth, halfHeight)
//       recalculateElementSize(large, printAreaDimensions.width, halfHeight)
//       break
//     }

//     case '3-bottom': {
//       // 1 ảnh lớn trên (full width x 1/2 height) + 2 ảnh nhỏ dưới (1/4)
//       const [large, small1, small2] = elements
//       recalculateElementSize(large, printAreaDimensions.width, halfHeight)
//       recalculateElementSize(small1, halfWidth, halfHeight)
//       recalculateElementSize(small2, halfWidth, halfHeight)
//       break
//     }

//     case '4-square':
//       // 4 ảnh lưới 2x2 (mỗi ảnh 1/4)
//       for (const element of elements) {
//         recalculateElementSize(element, halfWidth, halfHeight)
//       }
//       break

//     case '4-horizon':
//       // 4 ảnh ngang chồng nhau (full width x 1/4 height)
//       for (const element of elements) {
//         recalculateElementSize(element, printAreaDimensions.width, quarterHeight)
//       }
//       break

//     case '4-vertical':
//       // 4 ảnh dọc cạnh nhau (1/4 width x full height)
//       for (const element of elements) {
//         recalculateElementSize(element, quarterWidth, printAreaDimensions.height)
//       }
//       break
//   }

//   // Gán lại position cho các elements
//   assignPositionsToElements(
//     {
//       type: layout.layoutType,
//       elements: elements,
//       wastedArea: 0,
//       imageCount: elements.length,
//     },
//     printAreaDimensions
//   )

//   return elements
// }
