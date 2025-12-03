import { createInitialConstants } from '@/utils/contants'
import { useRef, useCallback, useState, useEffect } from 'react'

// Hook useRotateElement
interface UseElementRotationOptions {
  currentRotation: number
  setCurrentRotation: React.Dispatch<React.SetStateAction<number>>
  onRotationStart?: () => void
  onRotationEnd?: () => void
  snapThreshold?: number
  snapBreakThreshold?: number
}

interface UseElementRotationReturn {
  rotateButtonRef: React.RefObject<HTMLButtonElement | null>
  containerRef: React.RefObject<HTMLElement | null>
  resetRotation: () => void
  isRotating: boolean
}

// Hook useRotateElement
interface UseElementRotationOptions {
  currentRotation: number
  setCurrentRotation: React.Dispatch<React.SetStateAction<number>>
  onRotationStart?: () => void
  onRotationEnd?: () => void
  snapThreshold?: number
  snapBreakThreshold?: number
}

interface UseElementRotationReturn {
  rotateButtonRef: React.RefObject<HTMLButtonElement | null>
  containerRef: React.RefObject<HTMLElement | null>
  resetRotation: () => void
  isRotating: boolean
}

export const useSnapThresholdRotateElement = (
  options: UseElementRotationOptions
): UseElementRotationReturn => {
  const {
    currentRotation,
    setCurrentRotation,
    onRotationStart,
    onRotationEnd,
    snapThreshold = createInitialConstants<number>('ELEMENT_ROTATION_SNAP_THRESHOLD'),
    snapBreakThreshold = createInitialConstants<number>('ELEMENT_ROTATION_SNAP_BREAK_THRESHOLD'),
  } = options

  const rotateButtonRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLElement>(null)
  const isRotatingRef = useRef(false)
  const startAngleRef = useRef(0)
  const startRotationRef = useRef(0)
  const isSnappedRef = useRef(false)
  const snappedAngleRef = useRef(0)
  const previousAngleRef = useRef(0) // Lưu góc trước đó
  const rotationOffsetRef = useRef(0) // Lưu số vòng đã quay

  const [isRotating, setIsRotating] = useState<boolean>(false)

  const getNearestRightAngle = useCallback((angle: number): number => {
    return Math.round(angle / 90) * 90
  }, [])

  const getDistanceToNearestRightAngle = useCallback((angle: number): number => {
    const nearest = getNearestRightAngle(angle)
    let distance = Math.abs(angle - nearest)
    if (distance > 180) distance = 360 - distance
    return distance
  }, [])

  const getAngleFromCenter = useCallback((clientX: number, clientY: number): number => {
    if (!containerRef.current) return 0

    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const angle = Math.atan2(clientY - centerY, clientX - centerX)
    return angle * (180 / Math.PI)
  }, [])

  const handleStart = useCallback(
    (e: PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()

      isRotatingRef.current = true
      setIsRotating(true)
      isSnappedRef.current = false

      onRotationStart?.()

      const clientX = e.clientX
      const clientY = e.clientY

      const initialAngle = getAngleFromCenter(clientX, clientY)
      startAngleRef.current = initialAngle
      previousAngleRef.current = initialAngle
      startRotationRef.current = currentRotation
      rotationOffsetRef.current = 0

      document.body.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'
    },
    [currentRotation]
  )

  const handleMove = useCallback(
    (e: PointerEvent) => {
      if (!isRotatingRef.current) return

      e.preventDefault()
      e.stopPropagation()

      const currentX = e.clientX
      const currentY = e.clientY

      const currentAngle = getAngleFromCenter(currentX, currentY)

      // Tính delta angle so với góc trước đó
      let angleDelta = currentAngle - previousAngleRef.current

      // Xử lý trường hợp cross qua -180/180 boundary
      if (angleDelta > 180) {
        angleDelta -= 360
        rotationOffsetRef.current -= 360
      } else if (angleDelta < -180) {
        angleDelta += 360
        rotationOffsetRef.current += 360
      }

      // Cập nhật góc trước đó
      previousAngleRef.current = currentAngle

      // Tính góc xoay liên tục (không bị giới hạn -180/180)
      const continuousAngle = currentAngle + rotationOffsetRef.current
      const totalDelta = continuousAngle - startAngleRef.current
      let newRotation = startRotationRef.current + totalDelta

      const distanceToRightAngle = getDistanceToNearestRightAngle(newRotation)

      if (isSnappedRef.current) {
        const distanceFromSnapped = Math.abs(newRotation - snappedAngleRef.current)

        if (distanceFromSnapped > snapBreakThreshold) {
          isSnappedRef.current = false
          setCurrentRotation(newRotation)
        } else {
          setCurrentRotation(snappedAngleRef.current)
        }
      } else {
        if (distanceToRightAngle <= snapThreshold) {
          const nearestRightAngle = getNearestRightAngle(newRotation)
          isSnappedRef.current = true
          snappedAngleRef.current = nearestRightAngle
          setCurrentRotation(nearestRightAngle)
        } else {
          setCurrentRotation(newRotation)
        }
      }
    },
    [snapThreshold, snapBreakThreshold]
  )

  const handleEnd = useCallback(() => {
    isRotatingRef.current = false
    setIsRotating(false)
    isSnappedRef.current = false
    document.body.style.cursor = 'default'
    document.body.style.userSelect = 'auto'

    onRotationEnd?.()
  }, [])

  const resetRotation = useCallback(() => {
    setCurrentRotation(0)
  }, [])

  useEffect(() => {
    const button = rotateButtonRef.current
    if (!button) return

    button.addEventListener('pointerdown', handleStart)

    document.body.addEventListener('pointermove', handleMove)
    document.body.addEventListener('pointerup', handleEnd)
    document.body.addEventListener('pointercancel', handleEnd)

    return () => {
      button.removeEventListener('pointerdown', handleStart)

      document.body.removeEventListener('pointermove', handleMove)
      document.body.removeEventListener('pointerup', handleEnd)
      document.body.removeEventListener('pointercancel', handleEnd)

      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }
  }, [])

  return {
    rotateButtonRef,
    containerRef,
    resetRotation,
    isRotating,
  }
}
