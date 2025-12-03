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

const useRotateElement = (options: UseElementRotationOptions): UseElementRotationReturn => {
  const {
    currentRotation,
    setCurrentRotation,
    onRotationStart,
    onRotationEnd,
    snapThreshold = 15,
    snapBreakThreshold = 20,
  } = options

  const rotateButtonRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLElement>(null)
  const isRotatingRef = useRef(false)
  const startAngleRef = useRef(0)
  const startRotationRef = useRef(0)
  const isSnappedRef = useRef(false)
  const snappedAngleRef = useRef(0)

  const [isRotating, setIsRotating] = useState<boolean>(false)

  const getNearestRightAngle = useCallback((angle: number): number => {
    return Math.round(angle / 90) * 90
  }, [])

  const getDistanceToNearestRightAngle = useCallback(
    (angle: number): number => {
      const nearest = getNearestRightAngle(angle)
      let distance = Math.abs(angle - nearest)
      if (distance > 180) distance = 360 - distance
      return distance
    },
    [getNearestRightAngle]
  )

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

      startAngleRef.current = getAngleFromCenter(clientX, clientY)
      startRotationRef.current = currentRotation

      document.body.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'
    },
    [currentRotation, getAngleFromCenter, onRotationStart]
  )

  const handleMove = useCallback(
    (e: PointerEvent) => {
      if (!isRotatingRef.current) return

      e.preventDefault()
      e.stopPropagation()

      const currentX = e.clientX
      const currentY = e.clientY

      const currentAngle = getAngleFromCenter(currentX, currentY)

      let angleDelta = currentAngle - startAngleRef.current

      if (angleDelta > 180) angleDelta -= 360
      if (angleDelta < -180) angleDelta += 360

      let newRotation = startRotationRef.current + angleDelta

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
    [
      getAngleFromCenter,
      setCurrentRotation,
      getDistanceToNearestRightAngle,
      getNearestRightAngle,
      snapThreshold,
      snapBreakThreshold,
    ]
  )

  const handleEnd = useCallback(() => {
    isRotatingRef.current = false
    setIsRotating(false)
    isSnappedRef.current = false
    document.body.style.cursor = 'default'
    document.body.style.userSelect = 'auto'

    onRotationEnd?.()
  }, [onRotationEnd])

  const resetRotation = useCallback(() => {
    setCurrentRotation(0)
  }, [setCurrentRotation])

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
  }, [handleStart, handleMove, handleEnd])

  return {
    rotateButtonRef,
    containerRef,
    resetRotation,
    isRotating,
  }
}

// Demo Component
export default function DemoComponent() {
  const [rotation, setRotation] = useState(0)
  const [snapThreshold, setSnapThreshold] = useState(15)
  const [snapBreakThreshold, setSnapBreakThreshold] = useState(20)

  const { rotateButtonRef, containerRef, resetRotation, isRotating } = useRotateElement({
    currentRotation: rotation,
    setCurrentRotation: setRotation,
    snapThreshold,
    snapBreakThreshold,
    onRotationStart: () => console.log('Rotation started'),
    onRotationEnd: () => console.log('Rotation ended'),
  })

  const normalizedRotation = ((rotation % 360) + 360) % 360
  const nearestRightAngle = Math.round(normalizedRotation / 90) * 90
  const distanceToSnap = Math.min(
    Math.abs(normalizedRotation - nearestRightAngle),
    360 - Math.abs(normalizedRotation - nearestRightAngle)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Element Rotation with Snap</h1>
          <p className="text-slate-300">
            Kéo nút xoay để xoay element. Tự động snap vào góc vuông!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Rotation Area */}
          <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-center items-center h-[400px] relative">
              {/* Grid lines for reference */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-px bg-slate-600 opacity-30"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-full w-px bg-slate-600 opacity-30"></div>
              </div>

              {/* Rotatable element */}
              <div
                ref={containerRef as any}
                className="relative"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isRotating ? 'none' : 'transform 0.2s ease-out',
                }}
              >
                <div className="w-48 h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center">
                  <div className="text-white text-6xl font-bold">
                    {Math.round(normalizedRotation)}°
                  </div>
                </div>

                {/* Rotation handle */}
                <button
                  ref={rotateButtonRef}
                  className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-rotate-cw-icon lucide-rotate-cw h-[18px] w-[18px] md:w-5 md:h-5"
                  >
                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={resetRotation}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                {/* <RefreshCw className="w-4 h-4" /> */}
                Reset
              </button>
            </div>
          </div>

          {/* Right: Controls & Info */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Đang xoay:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isRotating ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {isRotating ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Góc hiện tại:</span>
                  <span className="text-white font-mono font-bold">
                    {Math.round(normalizedRotation)}°
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Góc vuông gần nhất:</span>
                  <span className="text-blue-400 font-mono font-bold">{nearestRightAngle}°</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Khoảng cách:</span>
                  <span
                    className={`font-mono font-bold ${
                      distanceToSnap <= snapThreshold ? 'text-green-400' : 'text-slate-400'
                    }`}
                  >
                    {distanceToSnap.toFixed(1)}°
                  </span>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Settings</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 mb-2">
                    Snap Threshold: <span className="text-white font-bold">{snapThreshold}°</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={snapThreshold}
                    onChange={(e) => setSnapThreshold(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-sm text-slate-400 mt-1">Khoảng cách để snap vào góc vuông</p>
                </div>

                <div>
                  <label className="block text-slate-300 mb-2">
                    Break Threshold:{' '}
                    <span className="text-white font-bold">{snapBreakThreshold}°</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="40"
                    value={snapBreakThreshold}
                    onChange={(e) => setSnapBreakThreshold(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-sm text-slate-400 mt-1">Khoảng cách để thoát khỏi snap</p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Hướng dẫn</h3>
              <ul className="space-y-2 text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Kéo nút tròn bên dưới để xoay element</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Element sẽ tự động snap khi gần góc vuông (0°, 90°, 180°, 270°)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Kéo xa hơn để thoát khỏi snap và xoay tự do</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Điều chỉnh threshold để thay đổi độ nhạy snap</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
