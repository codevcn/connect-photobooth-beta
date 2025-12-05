import { useEffect, useRef, useState } from 'react'
import Keyboard from 'react-simple-keyboard'
import 'simple-keyboard/build/css/index.css'
import { useVietnameseKeyboard } from '@/hooks/use-vietnamese-keyboard'
import '@/styles/virtual-keyboard.css'

type TVietnameseKeyboardProps = Partial<{
  onKeyPress: (button: string) => void
  onChange: (inputValue: string) => void
  onClose: () => void
  onSubmit: (value: string) => void
  inputValue: string
  placeholder: string
  theme: 'light' | 'dark'
  maxLength: number
  autoFocus: boolean
  keyboardRef: React.RefObject<any>
  keyboardName: string
  textDisplayerRef: React.RefObject<HTMLInputElement | null>
}>

export const VietnameseKeyboard = ({
  onKeyPress,
  onChange,
  onClose,
  onSubmit,
  inputValue = '',
  placeholder = 'Nhập văn bản...',
  theme = 'light',
  maxLength,
  autoFocus = true,
  keyboardRef: externalKeyboardRef,
  keyboardName = 'NAME-vietnamese-virtual-keyboard',
  textDisplayerRef,
}: TVietnameseKeyboardProps) => {
  const [input, setInput] = useState(inputValue)
  const [layoutName, setLayoutName] = useState('default')
  const internalKeyboardRef = useRef<any>(null)
  const keyboardRef = externalKeyboardRef || internalKeyboardRef
  const { inputMethod, toggleInputMethod, processVietnameseInput, resetBuffer } =
    useVietnameseKeyboard()

  const submitInputValue = () => {
    onSubmit?.(input)
    onClose?.()
    resetBuffer()
  }

  useEffect(() => {
    setInput(inputValue)
  }, [inputValue])

  const handleKeyPress = (button: string) => {
    if (button === '{shift}' || button === '{lock}') {
      setLayoutName(layoutName === 'default' ? 'shift' : 'default')
    } else if (button === '{bksp}') {
      const newInput = input.slice(0, -1)
      setInput(newInput)
      onChange?.(newInput)
      resetBuffer()
    } else if (button === '{space}') {
      const newInput = input + ' '
      setInput(newInput)
      onChange?.(newInput)
      resetBuffer()
    } else if (button === '{enter}') {
      onSubmit?.(input)
      onClose?.()
    } else if (button === '{toggle}') {
      toggleInputMethod()
    } else if (button === '{clear}') {
      setInput('')
      onChange?.('')
      resetBuffer()
    } else if (button === '{done}') {
      submitInputValue()
    } else {
      if (maxLength && input.length >= maxLength) {
        return
      }

      // Process Vietnamese input
      const newInput = processVietnameseInput(button, input)
      setInput(newInput)
      onChange?.(newInput)
    }

    onKeyPress?.(button)
  }

  const vietnameseLayout = {
    default: [
      '1 2 3 4 5 6 7 8 9 0 - = {bksp} {clear}',
      'q w e r t y u i o p [ ] \\',
      "a s d f g h j k l ; ' {enter}",
      '{shift} z x c v b n m , . / {shift}',
      '{space} {done}',
    ],
    shift: [
      '! @ # $ % ^ & * ( ) _ + {bksp} {clear}',
      'Q W E R T Y U I O P { } |',
      'A S D F G H J K L : " {enter}',
      '{shift} Z X C V B N M < > ? {shift}',
      '{space} {done}',
    ],
  }

  const display: Record<string, string> = {
    '{bksp}': `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-delete-icon lucide-delete"
      >
        <path d="M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" />
        <path d="m12 9 6 6" />
        <path d="m18 9-6 6" />
      </svg>
    `,
    '{enter}': `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="3"
      >
        <path
          stroke="#000"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
          d="M20 7v1.2c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C17.72 13 16.88 13 15.2 13H4m0 0 4-4m-4 4 4 4"
        />
      </svg>
    `,
    '{shift}': `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-arrow-big-up-icon lucide-arrow-big-up"
      >
        <path d="M9 13a1 1 0 0 0-1-1H5.061a1 1 0 0 1-.75-1.811l6.836-6.835a1.207 1.207 0 0 1 1.707 0l6.835 6.835a1 1 0 0 1-.75 1.811H16a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z" />
      </svg>
    `,
    '{space}': `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-space-icon lucide-space"
      >
        <path d="M22 17v1c0 .5-.5 1-1 1H3c-.5 0-1-.5-1-1v-1" />
      </svg>
    `,
    '{clear}': `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-eraser-icon lucide-eraser"
      >
        <path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21" />
        <path d="m5.082 11.09 8.828 8.828" />
      </svg>
    `,
    '{done}': `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-check-icon lucide-check"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    `,
  }

  const buttonTheme = [
    {
      class: 'hg-button-clear',
      buttons: '{clear}',
    },
    {
      class: 'hg-button-bksp',
      buttons: '{bksp}',
    },
    {
      class: 'hg-button-enter',
      buttons: '{enter}',
    },
    {
      class: 'hg-button-shift',
      buttons: '{shift}',
    },
    {
      class: 'hg-button-space',
      buttons: '{space}',
    },
    {
      class: 'hg-button-done',
      buttons: '{done}',
    },
  ]

  const catchEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submitInputValue()
    }
  }

  return (
    <div className={`${keyboardName} 5xl:text-[26px] w-full shadow-[0_3px_10px_rgba(0,0,0,0.8)]`}>
      {/* Display area - hiển thị nội dung đang nhập */}
      <div className="px-3 py-2 bg-white border-b border-gray-200">
        <input
          type="text"
          value={input}
          placeholder={placeholder}
          className="w-full outline-transparent focus:outline-main-cl overflow-y-auto px-2 py-1.5 text-[1em] border border-gray-200 rounded-lg bg-gray-50 whitespace-pre-wrap wrap-break-word"
          onChange={(e) => setInput(e.target.value)}
          ref={textDisplayerRef}
          onKeyDown={catchEnterKey}
        />
      </div>

      {/* Input method toggle - chuyển đổi VNI/Telex */}
      <div className="text-[0.8em] px-3 py-2 bg-white border-b border-gray-200 flex items-center gap-2">
        <span className="text-gray-600 font-medium">Kiểu gõ:</span>
        <button
          onClick={() => toggleInputMethod('telex')}
          className={`${
            inputMethod === 'telex' ? 'bg-main-cl text-white' : 'text-gray-800'
          } px-3 py-1.5 rounded-lg font-semibold mobile-touch border border-gray-300`}
        >
          TELEX
        </button>
        <button
          onClick={() => toggleInputMethod('vni')}
          className={`${
            inputMethod === 'vni' ? 'bg-main-cl text-white' : 'text-gray-800'
          } px-3 py-1.5 rounded-lg font-semibold mobile-touch border border-gray-300`}
        >
          VNI
        </button>
      </div>

      {/* Keyboard */}
      <div className="px-2 py-2 bg-white">
        <Keyboard
          keyboardRef={(r) => {
            keyboardRef.current = r
          }}
          layoutName={layoutName}
          layout={vietnameseLayout}
          display={display}
          onKeyPress={handleKeyPress}
          buttonTheme={buttonTheme}
          theme="hg-theme-default vietnamese-keyboard-drawer"
          preventMouseDownDefault={true}
        />
      </div>
    </div>
  )
}
