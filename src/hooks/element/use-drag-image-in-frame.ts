import { useRef, useEffect, useCallback } from 'react'

type TPosition = { x: number; y: number }
type TSize = { width: number; height: number }
type TBounds = { x: number; y: number; width: number; height: number }

interface UseDragImageInFrameOptions {
  frameId: string
  initialPosition?: TPosition
  disabled?: boolean
  saveElementPosition?: (frameId: string, position: TPosition) => void
}

interface UseDragImageInFrameReturn {
  imageRef: React.RefObject<HTMLElement | null>
}

/**
 * Hook để kéo ảnh trong frame với ràng buộc không cho ảnh di chuyển ra ngoài frame
 * Sử dụng lazy event listeners để tối ưu performance
 */
export const useDragImageInFrame = (
  options: UseDragImageInFrameOptions
): UseDragImageInFrameReturn => {
  const {
    frameId,
    initialPosition = { x: 0, y: 0 },
    disabled = false,
    saveElementPosition,
  } = options

  const imageRef = useRef<HTMLElement | null>(null)
  const isDraggingRef = useRef<boolean>(false)
  const dragStartPosRef = useRef<TPosition>({ x: 0, y: 0 })
  const imagePosRef = useRef<TPosition>(initialPosition)
  const frameBoundsRef = useRef<TBounds | null>(null)
  const imageSizeRef = useRef<TSize | null>(null)

  /**
   * Lấy thông tin frame và ảnh khi bắt đầu kéo
   */
  const captureFrameAndImageInfo = useCallback(() => {
    const imageElement = imageRef.current
    if (!imageElement) return false

    // Tìm frame container
    const frameElement = imageElement.closest('.NAME-template-frame') as HTMLElement
    if (!frameElement) return false

    // Lấy bounds của frame (relative to viewport)
    const frameRect = frameElement.getBoundingClientRect()
    frameBoundsRef.current = {
      x: frameRect.left,
      y: frameRect.top,
      width: frameRect.width,
      height: frameRect.height,
    }

    // Lấy kích thước của ảnh
    const imageRect = imageElement.getBoundingClientRect()
    imageSizeRef.current = {
      width: imageRect.width,
      height: imageRect.height,
    }

    return true
  }, [])

  /**
   * Tính toán vị trí mới của ảnh với ràng buộc trong frame
   */
  const calculateConstrainedPosition = useCallback((newX: number, newY: number): TPosition => {
    const frameBounds = frameBoundsRef.current
    const imageSize = imageSizeRef.current

    if (!frameBounds || !imageSize) {
      return { x: newX, y: newY }
    }

    // Tính toán giới hạn
    const minX = 0
    const minY = 0
    const maxX = frameBounds.width - imageSize.width
    const maxY = frameBounds.height - imageSize.height

    // Ràng buộc vị trí trong frame
    const constrainedX = Math.max(minX, Math.min(maxX, newX))
    const constrainedY = Math.max(minY, Math.min(maxY, newY))

    return { x: constrainedX, y: constrainedY }
  }, [])

  /**
   * Cập nhật vị trí ảnh trực tiếp trên DOM (không trigger re-render)
   */
  const updateImagePosition = useCallback(
    (position: TPosition) => {
      const imageElement = imageRef.current
      if (!imageElement) return

      imageElement.style.transform = `translate(${position.x}px, ${position.y}px)`
      imagePosRef.current = position

      // Gọi callback để lưu vị trí nếu có
      if (saveElementPosition) {
        saveElementPosition(frameId, position)
      }
    },
    [frameId, saveElementPosition]
  )

  /**
   * Xử lý khi di chuyển chuột
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current || disabled) return

      e.preventDefault()

      const frameBounds = frameBoundsRef.current
      if (!frameBounds) return

      // Tính toán delta di chuyển
      const deltaX = e.clientX - dragStartPosRef.current.x
      const deltaY = e.clientY - dragStartPosRef.current.y

      // Tính vị trí mới (relative to frame)
      const newX = imagePosRef.current.x + deltaX
      const newY = imagePosRef.current.y + deltaY

      // Ràng buộc vị trí trong frame
      const constrainedPos = calculateConstrainedPosition(newX, newY)

      // Cập nhật vị trí
      updateImagePosition(constrainedPos)

      // Cập nhật drag start position cho lần move tiếp theo
      dragStartPosRef.current = {
        x: e.clientX,
        y: e.clientY,
      }
    },
    [disabled, calculateConstrainedPosition, updateImagePosition]
  )

  /**
   * Xử lý khi thả chuột
   */
  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return

    isDraggingRef.current = false

    // Reset cursor
    if (imageRef.current) {
      imageRef.current.style.cursor = 'grab'
    }

    // ✨ Remove listeners ngay khi xong drag
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }, [handleMouseMove])

  /**
   * Xử lý khi di chuyển ngón tay
   */
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDraggingRef.current || disabled) return

      e.preventDefault()

      const touch = e.touches[0]
      if (!touch) return

      const frameBounds = frameBoundsRef.current
      if (!frameBounds) return

      // Tính toán delta di chuyển
      const deltaX = touch.clientX - dragStartPosRef.current.x
      const deltaY = touch.clientY - dragStartPosRef.current.y

      // Tính vị trí mới (relative to frame)
      const newX = imagePosRef.current.x + deltaX
      const newY = imagePosRef.current.y + deltaY

      // Ràng buộc vị trí trong frame
      const constrainedPos = calculateConstrainedPosition(newX, newY)

      // Cập nhật vị trí
      updateImagePosition(constrainedPos)

      // Cập nhật drag start position cho lần move tiếp theo
      dragStartPosRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      }
    },
    [disabled, calculateConstrainedPosition, updateImagePosition]
  )

  /**
   * Xử lý khi kết thúc chạm
   */
  const handleTouchEnd = useCallback(() => {
    if (!isDraggingRef.current) return

    isDraggingRef.current = false

    // Remove listeners ngay khi xong drag
    window.removeEventListener('touchmove', handleTouchMove)
    window.removeEventListener('touchend', handleTouchEnd)
  }, [handleTouchMove])

  /**
   * Xử lý khi bắt đầu kéo (chuột)
   */
  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (disabled) return

      e.preventDefault()
      e.stopPropagation()

      // Capture thông tin frame và ảnh
      if (!captureFrameAndImageInfo()) return

      isDraggingRef.current = true
      dragStartPosRef.current = {
        x: e.clientX,
        y: e.clientY,
      }

      // Thêm cursor grabbing
      if (imageRef.current) {
        imageRef.current.style.cursor = 'grabbing'
      }

      // Add listeners CHỈ KHI đang drag
      window.addEventListener('mousemove', handleMouseMove, { passive: false })
      window.addEventListener('mouseup', handleMouseUp)
    },
    [disabled, captureFrameAndImageInfo, handleMouseMove, handleMouseUp]
  )

  /**
   * Xử lý khi bắt đầu chạm (touch)
   */
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled) return

      e.stopPropagation()

      const touch = e.touches[0]
      if (!touch) return

      // Capture thông tin frame và ảnh
      if (!captureFrameAndImageInfo()) return

      isDraggingRef.current = true
      dragStartPosRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      }

      // Add listeners CHỈ KHI đang drag
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleTouchEnd)
    },
    [disabled, captureFrameAndImageInfo, handleTouchMove, handleTouchEnd]
  )

  /**
   * Setup event listeners
   */
  useEffect(() => {
    const imageElement = imageRef.current
    if (!imageElement) return

    // Set initial position
    updateImagePosition(initialPosition)

    // Set cursor
    if (!disabled) {
      imageElement.style.cursor = 'grab'
    }

    // ✨ CHỈ add mousedown/touchstart trên element
    // Window listeners sẽ được add lazy khi cần
    imageElement.addEventListener('mousedown', handleMouseDown, { passive: false })
    imageElement.addEventListener('touchstart', handleTouchStart, { passive: false })

    // Cleanup
    return () => {
      imageElement.removeEventListener('mousedown', handleMouseDown)
      imageElement.removeEventListener('touchstart', handleTouchStart)

      // Đảm bảo cleanup window listeners nếu component unmount khi đang drag
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [
    disabled,
    initialPosition,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    updateImagePosition,
  ])

  return { imageRef }
}
