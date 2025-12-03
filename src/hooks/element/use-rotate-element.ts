import { useRef, useCallback, useState, useEffect } from 'react'

type UseElementRotationOptions = {
  currentRotation: number
  setCurrentRotation: React.Dispatch<React.SetStateAction<number>>
  onRotationStart?: () => void // Callback khi bắt đầu xoay
  onRotationEnd?: () => void // Callback khi kết thúc xoay
}

type UseElementRotationReturn = {
  rotateButtonRef: React.RefObject<HTMLButtonElement | null>
  containerRef: React.RefObject<HTMLElement | null>
  resetRotation: () => void
  isRotating: boolean
}

export const useRotateElement = (options: UseElementRotationOptions): UseElementRotationReturn => {
  const { currentRotation, setCurrentRotation, onRotationStart, onRotationEnd } = options

  // Refs
  const rotateButtonRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLElement>(null)
  const isRotatingRef = useRef(false)
  const startAngleRef = useRef(0)
  const startRotationRef = useRef(0)

  // State
  const [isRotating, setIsRotating] = useState<boolean>(false)

  // Hàm tính góc từ tâm phần tử đến điểm (x, y)
  const getAngleFromCenter = useCallback((clientX: number, clientY: number): number => {
    if (!containerRef.current) return 0

    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // Tính góc từ tâm đến vị trí con trỏ
    const angle = Math.atan2(clientY - centerY, clientX - centerX)

    // Chuyển sang độ
    return angle * (180 / Math.PI)
  }, [])

  // Xử lý khi bắt đầu nhấn vào nút xoay
  const handleStart = useCallback(
    (e: PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()

      isRotatingRef.current = true
      setIsRotating(true)

      // Gọi callback để thông báo đang xoay
      onRotationStart?.()

      // Lấy vị trí X và Y ban đầu
      const clientX = e.clientX
      const clientY = e.clientY

      startAngleRef.current = getAngleFromCenter(clientX, clientY)
      startRotationRef.current = currentRotation

      document.body.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'
    },
    [currentRotation, getAngleFromCenter, onRotationStart]
  )

  // Xử lý khi di chuyển
  const handleMove = useCallback((e: PointerEvent) => {
    if (!isRotatingRef.current) return

    e.preventDefault()
    e.stopPropagation()

    // Lấy vị trí X và Y hiện tại
    const currentX = e.clientX
    const currentY = e.clientY

    // Tính góc hiện tại
    const currentAngle = getAngleFromCenter(currentX, currentY)

    // Tính độ chênh lệch góc
    let angleDelta = currentAngle - startAngleRef.current

    // Xử lý trường hợp góc vượt qua -180/180 độ
    if (angleDelta > 180) angleDelta -= 360
    if (angleDelta < -180) angleDelta += 360

    // Cập nhật góc xoay mới
    const newRotation = startRotationRef.current + angleDelta
    setCurrentRotation(newRotation)
  }, [])

  // Xử lý khi thả chuột/tay
  const handleEnd = useCallback(() => {
    isRotatingRef.current = false
    setIsRotating(false)
    document.body.style.cursor = 'default'
    document.body.style.userSelect = 'auto'

    // Gọi callback để thông báo kết thúc xoay
    onRotationEnd?.()
  }, [onRotationEnd])

  // Reset góc xoay
  const resetRotation = useCallback(() => {
    setCurrentRotation(currentRotation)
  }, [currentRotation])

  // Effect để đăng ký/hủy sự kiện
  useEffect(() => {
    const button = rotateButtonRef.current
    if (!button) return

    // Đăng ký sự kiện chỉ trên nút xoay
    button.addEventListener('pointerdown', handleStart)

    // Sự kiện move và end trên document để xử lý khi kéo ra ngoài
    document.body.addEventListener('pointermove', handleMove)
    document.body.addEventListener('pointerup', handleEnd)
    document.body.addEventListener('pointercancel', handleEnd)

    // Cleanup
    return () => {
      button.removeEventListener('pointerdown', handleStart)

      document.body.removeEventListener('pointermove', handleMove)
      document.body.removeEventListener('pointerup', handleEnd)
      document.body.removeEventListener('pointercancel', handleEnd)

      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }
  }, [handleStart, handleMove, handleEnd])

  return {
    rotateButtonRef,
    containerRef,
    resetRotation,
    isRotating,
  }
}
