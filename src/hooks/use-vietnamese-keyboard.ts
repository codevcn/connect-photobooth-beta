import { useState, useCallback } from 'react'

type TInputMethod = 'telex' | 'vni'

// Vietnamese tone marks mapping
const VIETNAMESE_TONES = {
  // Acute (sắc)
  acute: {
    a: 'á',
    ă: 'ắ',
    â: 'ấ',
    e: 'é',
    ê: 'ế',
    i: 'í',
    o: 'ó',
    ô: 'ố',
    ơ: 'ớ',
    u: 'ú',
    ư: 'ứ',
    y: 'ý',
  },
  // Grave (huyền)
  grave: {
    a: 'à',
    ă: 'ằ',
    â: 'ầ',
    e: 'è',
    ê: 'ề',
    i: 'ì',
    o: 'ò',
    ô: 'ồ',
    ơ: 'ờ',
    u: 'ù',
    ư: 'ừ',
    y: 'ỳ',
  },
  // Hook above (hỏi)
  hook: {
    a: 'ả',
    ă: 'ẳ',
    â: 'ẩ',
    e: 'ẻ',
    ê: 'ể',
    i: 'ỉ',
    o: 'ỏ',
    ô: 'ổ',
    ơ: 'ở',
    u: 'ủ',
    ư: 'ử',
    y: 'ỷ',
  },
  // Tilde (ngã)
  tilde: {
    a: 'ã',
    ă: 'ẵ',
    â: 'ẫ',
    e: 'ẽ',
    ê: 'ễ',
    i: 'ĩ',
    o: 'õ',
    ô: 'ỗ',
    ơ: 'ỡ',
    u: 'ũ',
    ư: 'ữ',
    y: 'ỹ',
  },
  // Dot below (nặng)
  dot: {
    a: 'ạ',
    ă: 'ặ',
    â: 'ậ',
    e: 'ẹ',
    ê: 'ệ',
    i: 'ị',
    o: 'ọ',
    ô: 'ộ',
    ơ: 'ợ',
    u: 'ụ',
    ư: 'ự',
    y: 'ỵ',
  },
}

// Vowel modifications
const VOWEL_MODS = {
  a: { breve: 'ă', circumflex: 'â' },
  e: { circumflex: 'ê' },
  o: { circumflex: 'ô', horn: 'ơ' },
  u: { horn: 'ư' },
  d: { stroke: 'đ' },
}

type TVowelKey = 'a' | 'e' | 'o' | 'u' | 'd'
type TBaseVowel = 'a' | 'ă' | 'â' | 'e' | 'ê' | 'i' | 'o' | 'ô' | 'ơ' | 'u' | 'ư' | 'y'

// Telex mapping
const TELEX_MAP: Record<
  string,
  { base: TVowelKey; type: 'breve' | 'circumflex' | 'horn' | 'stroke' }
> = {
  aw: { base: 'a', type: 'breve' },
  aa: { base: 'a', type: 'circumflex' },
  ee: { base: 'e', type: 'circumflex' },
  oo: { base: 'o', type: 'circumflex' },
  ow: { base: 'o', type: 'horn' },
  uw: { base: 'u', type: 'horn' },
  dd: { base: 'd', type: 'stroke' },
}

const TELEX_TONES: Record<string, keyof typeof VIETNAMESE_TONES> = {
  s: 'acute',
  f: 'grave',
  r: 'hook',
  x: 'tilde',
  j: 'dot',
}

// VNI mapping
const VNI_MAP: Record<
  string,
  { base: TVowelKey; type: 'breve' | 'circumflex' | 'horn' | 'stroke' }
> = {
  a8: { base: 'a', type: 'breve' },
  a6: { base: 'a', type: 'circumflex' },
  e6: { base: 'e', type: 'circumflex' },
  o6: { base: 'o', type: 'circumflex' },
  o7: { base: 'o', type: 'horn' },
  u7: { base: 'u', type: 'horn' },
  d9: { base: 'd', type: 'stroke' },
}

const VNI_TONES: Record<string, keyof typeof VIETNAMESE_TONES> = {
  '1': 'acute',
  '2': 'grave',
  '3': 'hook',
  '4': 'tilde',
  '5': 'dot',
}

export const useVietnameseKeyboard = () => {
  const [inputMethod, setInputMethod] = useState<TInputMethod>('telex')
  const [buffer, setBuffer] = useState<string>('')

  const toggleInputMethod = useCallback((forceMethod?: TInputMethod) => {
    setInputMethod((prev) => (forceMethod ? forceMethod : prev === 'telex' ? 'vni' : 'telex'))
    setBuffer('')
  }, [])

  const processVietnameseInput = useCallback(
    (input: string, currentValue: string): string => {
      const lowerInput = input.toLowerCase()
      let result = currentValue

      if (inputMethod === 'telex') {
        // Check for tone marks
        if (TELEX_TONES[lowerInput]) {
          const tone = TELEX_TONES[lowerInput]
          // Apply tone to the last valid vowel in buffer
          const lastChar = buffer.slice(-1).toLowerCase() as TBaseVowel
          if (VIETNAMESE_TONES[tone][lastChar]) {
            const replacement = VIETNAMESE_TONES[tone][lastChar]
            result =
              currentValue.slice(0, -1) +
              (input === input.toUpperCase() ? replacement.toUpperCase() : replacement)
            setBuffer('')
            return result
          }
        }

        // Check for vowel modifications
        const twoCharKey = buffer.toLowerCase() + lowerInput
        if (TELEX_MAP[twoCharKey]) {
          const { base, type } = TELEX_MAP[twoCharKey]
          const modEntry = VOWEL_MODS[base]
          if (modEntry && type in modEntry) {
            const modified = modEntry[type as keyof typeof modEntry] as string
            result =
              currentValue.slice(0, -1) +
              (input === input.toUpperCase() ? modified.toUpperCase() : modified)
            setBuffer(modified)
            return result
          }
        }
      } else {
        // VNI mode
        // Check for tone marks
        if (VNI_TONES[lowerInput]) {
          const tone = VNI_TONES[lowerInput]
          const lastChar = buffer.slice(-1).toLowerCase() as TBaseVowel
          if (VIETNAMESE_TONES[tone][lastChar]) {
            const replacement = VIETNAMESE_TONES[tone][lastChar]
            result =
              currentValue.slice(0, -1) +
              (buffer.slice(-1) === buffer.slice(-1).toUpperCase()
                ? replacement.toUpperCase()
                : replacement)
            setBuffer('')
            return result
          }
        }

        // Check for vowel modifications
        const twoCharKey = buffer.toLowerCase() + lowerInput
        if (VNI_MAP[twoCharKey]) {
          const { base, type } = VNI_MAP[twoCharKey]
          const modEntry = VOWEL_MODS[base]
          if (modEntry && type in modEntry) {
            const modified = modEntry[type as keyof typeof modEntry] as string
            result =
              currentValue.slice(0, -1) +
              (buffer === buffer.toUpperCase() ? modified.toUpperCase() : modified)
            setBuffer(modified)
            return result
          }
        }
      }

      // Regular character
      setBuffer(lowerInput)
      result = currentValue + input
      return result
    },
    [inputMethod, buffer]
  )

  const resetBuffer = useCallback(() => {
    setBuffer('')
  }, [])

  return {
    inputMethod,
    toggleInputMethod,
    processVietnameseInput,
    resetBuffer,
  }
}
