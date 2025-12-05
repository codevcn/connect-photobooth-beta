import { createPortal } from 'react-dom'
import { VietnameseKeyboard } from './VietnameseKeyboard'
import { useEffect } from 'react'

type TVietnameseKeyboardModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (text: string) => void
  initialValue?: string
  title?: string
  placeholder?: string
  maxLength?: number
  theme?: 'light' | 'dark'
}

export const VietnameseKeyboardModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialValue = '',
  title = 'Nhập văn bản',
  placeholder = 'Nhập văn bản...',
  maxLength,
  theme = 'light',
}: TVietnameseKeyboardModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleClose = () => {
    onClose()
  }

  const handleSubmit = (text: string) => {
    onSubmit(text)
    onClose()
  }

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-999 flex justify-center animate-fade-in items-end md:items-center p-0 md:p-4"
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-[950px] overflow-y-auto animate-slide-up shadow-2xl max-h-[85vh] md:max-h-[90vh] rounded-t-2xl md:rounded-2xl rounded-b-none md:rounded-b-2xl ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between border-b-2 px-5 md:px-6 py-4 md:py-5 ${
          theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
        }`}>
          <h3 className={`font-bold m-0 text-lg md:text-xl ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            {title}
          </h3>
          <button
            onClick={handleClose}
            className={`bg-transparent border-0 cursor-pointer p-2 flex items-center justify-center rounded-lg transition-all active:scale-95 ${
              theme === 'dark'
                ? 'text-gray-400 hover:bg-gray-600 hover:text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
            aria-label="Đóng"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-4 md:p-6">
          <VietnameseKeyboard
            inputValue={initialValue}
            placeholder={placeholder}
            maxLength={maxLength}
            theme={theme}
            onChange={(text) => {
              // Real-time update if needed
            }}
            onClose={() => {
              // Get current value and submit
              const input = document.querySelector<HTMLInputElement>(
                'input[type="text"]'
              )
              if (input) {
                handleSubmit(input.value)
              }
            }}
          />
        </div>
      </div>
    </div>,
    document.body
  )
}
