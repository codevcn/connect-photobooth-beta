import React, { useRef, useState } from 'react'
import ReactDOM from 'react-dom'

const MyDevComponent2: React.FC = () => {
  const buttonRef = useRef<HTMLDivElement>(null)
  const [showModal, setShowModal] = useState(false)

  const [rectCount, setRectCount] = useState(1)

  // Với mỗi HCN → lưu x,y,w,h dạng string (để nhập biểu thức)
  const [rects, setRects] = useState<{ x: string; y: string; w: string; h: string }[]>([
    { x: '', y: '', w: '', h: '' },
  ])

  // KẾT QUẢ → array nhiều HCN → mỗi HCN có 4 điểm
  const [points, setPoints] = useState<{ x: number; y: number }[][]>([])

  // =============================
  // SAFE EVAL (tính expression)
  // =============================
  const safeEvalExpression = (expr: string): number | null => {
    const cleaned = expr.replace(/\s+/g, '')
    if (!/^[0-9+\-*/().]+$/.test(cleaned)) return null

    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function(`return (${cleaned})`)
      const value = fn()
      return typeof value === 'number' && !isNaN(value) ? value : null
    } catch {
      return null
    }
  }

  // =============================
  // Change rect count
  // =============================
  const handleChangeRectCount = (count: number) => {
    setRectCount(count)

    const arr = []
    for (let i = 0; i < count; i++) {
      arr.push({ x: '', y: '', w: '', h: '' })
    }
    setRects(arr)
  }

  // =============================
  // Update single HCN input
  // =============================
  const updateRect = (idx: number, key: 'x' | 'y' | 'w' | 'h', val: string) => {
    const clone = [...rects]
    clone[idx][key] = val
    setRects(clone)
  }

  // =============================
  // Render line
  // =============================
  const renderLine = (p1: any, p2: any, index: number) => {
    if (!p1 || !p2) return null

    const dx = p2.x - p1.x
    const dy = p2.y - p1.y

    const length = Math.sqrt(dx * dx + dy * dy)
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI

    return (
      <div
        key={`line-${index}`}
        style={{
          position: 'fixed',
          top: p1.y,
          left: p1.x,
          width: length,
          height: 3,
          background: '#2563eb',
          transform: `rotate(${angle}deg)`,
          transformOrigin: '0 50%',
          zIndex: 9999,
        }}
      />
    )
  }

  // =============================
  // OK → tính 4 điểm từ x,y,w,h
  // =============================
  const handleOk = () => {
    const rectPoints = rects
      .map((r) => {
        const x = safeEvalExpression(r.x)
        const y = safeEvalExpression(r.y)
        const w = safeEvalExpression(r.w)
        const h = safeEvalExpression(r.h)

        if ([x, y, w, h].some((v) => v === null)) return null

        const p1 = { x: x!, y: y! }
        const p2 = { x: x! + w!, y: y! }
        const p3 = { x: x! + w!, y: y! + h! }
        const p4 = { x: x!, y: y! + h! }

        return [p1, p2, p3, p4]
      })
      .filter(Boolean) as { x: number; y: number }[][]

    setPoints(rectPoints)
    setShowModal(false)
  }

  // =============================
  // Show/hide mock page
  // =============================
  const showMockPrintArea = () => {
    const tempContainer = document.querySelector<HTMLElement>('.NAME-app-temp-container')!
    tempContainer.style.zIndex = '9999'
    tempContainer.style.overflow = 'visible'
    tempContainer.style.top = '0'
    tempContainer.style.bottom = 'auto'
    document.querySelector('.NAME-edit-page-root')?.classList.add('hidden')
  }

  const hideMockPrintArea = () => {
    const tempContainer = document.querySelector<HTMLElement>('.NAME-app-temp-container')!
    tempContainer.style.zIndex = '-1'
    tempContainer.style.overflow = 'hidden'
    tempContainer.style.top = 'auto'
    tempContainer.style.bottom = '0'
    document.querySelector('.NAME-edit-page-root')?.classList.remove('hidden')
  }

  const portalRoot = document.body

  const catchEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleOk()
    }
  }

  return ReactDOM.createPortal(
    <>
      {/* BUTTON CONTROL CŨ  — GIỮ NGUYÊN */}
      <div
        onClick={showMockPrintArea}
        className="fixed top-0 left-0 bg-red-600 text-white px-4 py-2 cursor-pointer z-9999"
      >
        show
      </div>

      <div
        onClick={hideMockPrintArea}
        className="fixed top-12 left-0 bg-green-600 text-white px-4 py-2 cursor-pointer z-9999"
      >
        hide
      </div>

      <div
        onClick={() => setShowModal(true)}
        className="fixed top-24 left-0 bg-blue-600 text-white px-4 py-2 cursor-pointer z-9999"
      >
        OK
      </div>

      {/* DRAW RECT POINTS */}
      {points.map((rect, rectIndex) => (
        <React.Fragment key={rectIndex}>
          {rect.map((p, idx) => (
            <div
              key={`p-${rectIndex}-${idx}`}
              className="fixed bg-blue-600"
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                top: p.y,
                left: p.x,
                transform: 'translate(-50%, -50%)',
                zIndex: 10000,
              }}
            />
          ))}

          {/* 4 lines */}
          {renderLine(rect[0], rect[1], 1)}
          {renderLine(rect[1], rect[2], 2)}
          {renderLine(rect[2], rect[3], 3)}
          {renderLine(rect[3], rect[0], 4)}
        </React.Fragment>
      ))}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-99999">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[800px] max-h-[90vh] overflow-hidden">
            <h2 className="text-lg font-semibold mb-4">Tạo nhiều HCN (x, y, w, h)</h2>

            {/* Rect count input */}
            <div className="mb-4">
              <label className="font-medium">Số lượng HCN:</label>
              <input
                type="number"
                className="border p-2 rounded w-full mt-2"
                min={1}
                value={rectCount}
                onChange={(e) => handleChangeRectCount(Number(e.target.value))}
              />
            </div>

            {/* Rect XYWH inputs */}
            <div className="space-y-3" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
              {rects.map((r, idx) => (
                <div key={idx} className="border rounded p-3 bg-gray-50 shadow-sm">
                  <div className="font-semibold mb-2">HCN {idx + 1}</div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="x"
                      value={r.x}
                      onChange={(e) => updateRect(idx, 'x', e.target.value)}
                      className="border p-2 rounded"
                      onKeyDown={catchEnterKey}
                    />
                    <input
                      type="text"
                      placeholder="y"
                      value={r.y}
                      onChange={(e) => updateRect(idx, 'y', e.target.value)}
                      className="border p-2 rounded"
                      onKeyDown={catchEnterKey}
                    />
                    <input
                      type="text"
                      placeholder="w"
                      value={r.w}
                      onChange={(e) => updateRect(idx, 'w', e.target.value)}
                      className="border p-2 rounded"
                      onKeyDown={catchEnterKey}
                    />
                    <input
                      type="text"
                      placeholder="h"
                      value={r.h}
                      onChange={(e) => updateRect(idx, 'h', e.target.value)}
                      className="border p-2 rounded"
                      onKeyDown={catchEnterKey}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleOk}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>,
    portalRoot
  )
}

export const MyDevComponent = MyDevComponent2
