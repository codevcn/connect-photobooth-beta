import { useKeyboardStore } from '@/stores/keyboard/keyboard.store'

export const useGlobalKeyboard = () => {
  const { isVisible, showKeyboard, hideKeyboard } = useKeyboardStore()

  return {
    isKeyboardVisible: isVisible,
    showKeyboard: (input: HTMLInputElement | HTMLTextAreaElement) => showKeyboard(input),
    hideKeyboard,
  }
}

