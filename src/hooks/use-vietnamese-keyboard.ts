import { useState, useCallback } from 'react'

type TInputMethod = 'telex' | 'vni'

// Vietnamese tone marks mapping
const VIETNAMESE_TONES: Record<string, Record<string, string>> = {
  // Acute (sắc)
  acute: {
    a: 'á', A: 'Á',
    ă: 'ắ', Ă: 'Ắ',
    â: 'ấ', Â: 'Ấ',
    e: 'é', E: 'É',
    ê: 'ế', Ê: 'Ế',
    i: 'í', I: 'Í',
    o: 'ó', O: 'Ó',
    ô: 'ố', Ô: 'Ố',
    ơ: 'ớ', Ơ: 'Ớ',
    u: 'ú', U: 'Ú',
    ư: 'ứ', Ư: 'Ứ',
    y: 'ý', Y: 'Ý',
  },
  // Grave (huyền)
  grave: {
    a: 'à', A: 'À',
    ă: 'ằ', Ă: 'Ằ',
    â: 'ầ', Â: 'Ầ',
    e: 'è', E: 'È',
    ê: 'ề', Ê: 'Ề',
    i: 'ì', I: 'Ì',
    o: 'ò', O: 'Ò',
    ô: 'ồ', Ô: 'Ồ',
    ơ: 'ờ', Ơ: 'Ờ',
    u: 'ù', U: 'Ù',
    ư: 'ừ', Ư: 'Ừ',
    y: 'ỳ', Y: 'Ỳ',
  },
  // Hook above (hỏi)
  hook: {
    a: 'ả', A: 'Ả',
    ă: 'ẳ', Ă: 'Ẳ',
    â: 'ẩ', Â: 'Ẩ',
    e: 'ẻ', E: 'Ẻ',
    ê: 'ể', Ê: 'Ể',
    i: 'ỉ', I: 'Ỉ',
    o: 'ỏ', O: 'Ỏ',
    ô: 'ổ', Ô: 'Ổ',
    ơ: 'ở', Ơ: 'Ở',
    u: 'ủ', U: 'Ủ',
    ư: 'ử', Ư: 'Ử',
    y: 'ỷ', Y: 'Ỷ',
  },
  // Tilde (ngã)
  tilde: {
    a: 'ã', A: 'Ã',
    ă: 'ẵ', Ă: 'Ẵ',
    â: 'ẫ', Â: 'Ẫ',
    e: 'ẽ', E: 'Ẽ',
    ê: 'ễ', Ê: 'Ễ',
    i: 'ĩ', I: 'Ĩ',
    o: 'õ', O: 'Õ',
    ô: 'ỗ', Ô: 'Ỗ',
    ơ: 'ỡ', Ơ: 'Ỡ',
    u: 'ũ', U: 'Ũ',
    ư: 'ữ', Ư: 'Ữ',
    y: 'ỹ', Y: 'Ỹ',
  },
  // Dot below (nặng)
  dot: {
    a: 'ạ', A: 'Ạ',
    ă: 'ặ', Ă: 'Ặ',
    â: 'ậ', Â: 'Ậ',
    e: 'ẹ', E: 'Ẹ',
    ê: 'ệ', Ê: 'Ệ',
    i: 'ị', I: 'Ị',
    o: 'ọ', O: 'Ọ',
    ô: 'ộ', Ô: 'Ộ',
    ơ: 'ợ', Ơ: 'Ợ',
    u: 'ụ', U: 'Ụ',
    ư: 'ự', Ư: 'Ự',
    y: 'ỵ', Y: 'Ỵ',
  },
}

// Vowel modifications (lowercase only, we handle case separately)
const VOWEL_MODS: Record<string, Record<string, string>> = {
  a: { breve: 'ă', circumflex: 'â' },
  e: { circumflex: 'ê' },
  o: { circumflex: 'ô', horn: 'ơ' },
  u: { horn: 'ư' },
  d: { stroke: 'đ' },
}

// All vowels that can receive tones (including modified vowels)
const VOWELS_FOR_TONE = new Set([
  'a', 'ă', 'â', 'e', 'ê', 'i', 'o', 'ô', 'ơ', 'u', 'ư', 'y',
  'A', 'Ă', 'Â', 'E', 'Ê', 'I', 'O', 'Ô', 'Ơ', 'U', 'Ư', 'Y',
])

// Telex tone keys
const TELEX_TONES: Record<string, string> = {
  s: 'acute',
  f: 'grave',
  r: 'hook',
  x: 'tilde',
  j: 'dot',
}

// VNI tone keys
const VNI_TONES: Record<string, string> = {
  '1': 'acute',
  '2': 'grave',
  '3': 'hook',
  '4': 'tilde',
  '5': 'dot',
}

// Telex vowel modification keys
const TELEX_VOWEL_MODS: Record<string, { targets: string[]; type: string }> = {
  w: { targets: ['a', 'o', 'u'], type: 'w' }, // ă, ơ, ư
  a: { targets: ['a'], type: 'circumflex' }, // aa -> â
  e: { targets: ['e'], type: 'circumflex' }, // ee -> ê
  o: { targets: ['o'], type: 'circumflex' }, // oo -> ô
  d: { targets: ['d'], type: 'stroke' }, // dd -> đ
}

// VNI vowel modification keys
const VNI_VOWEL_MODS: Record<string, { target: string; type: string }> = {
  '6': { target: 'aeo', type: 'circumflex' }, // a6->â, e6->ê, o6->ô
  '7': { target: 'ou', type: 'horn' }, // o7->ơ, u7->ư
  '8': { target: 'a', type: 'breve' }, // a8->ă
  '9': { target: 'd', type: 'stroke' }, // d9->đ
}

/**
 * Extract the last word from a string (word = continuous letters)
 */
const getLastWord = (text: string): { word: string; startIndex: number } => {
  const match = text.match(/[a-zA-ZàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]+$/)
  if (match) {
    return { word: match[0], startIndex: text.length - match[0].length }
  }
  return { word: '', startIndex: text.length }
}

/**
 * Find the best vowel position to apply tone in a Vietnamese word
 * Rules: ưa/ươ -> second vowel, others -> first vowel in vowel cluster, or last vowel
 */
const findVowelForTone = (word: string): number => {
  const vowelIndices: number[] = []
  for (let i = 0; i < word.length; i++) {
    if (VOWELS_FOR_TONE.has(word[i])) {
      vowelIndices.push(i)
    }
  }
  
  if (vowelIndices.length === 0) return -1
  if (vowelIndices.length === 1) return vowelIndices[0]
  
  // Special cases for Vietnamese diphthongs/triphthongs
  const lowerWord = word.toLowerCase()
  
  // ươ, ưa -> tone on the second vowel
  for (let i = 0; i < vowelIndices.length - 1; i++) {
    const idx = vowelIndices[i]
    const nextIdx = vowelIndices[i + 1]
    if (nextIdx === idx + 1) {
      const pair = lowerWord[idx] + lowerWord[nextIdx]
      if (pair === 'ươ' || pair === 'ưa') {
        return nextIdx
      }
    }
  }
  
  // For other cases: find vowel cluster and return the main vowel
  // oa, oe, uy -> second vowel
  // ai, ao, au, ay, âu, ây, eo, êu, ia, iê, iu, oa, oă, oe, oi, oo, ôi, ơi, ua, uâ, ue, ui, uô, uơ, uy, ưi, ưu, ya, yê -> varies
  
  // Simple rule: if there's a vowel cluster, prefer the vowel that's not i/u/y at edges
  for (let i = 0; i < vowelIndices.length; i++) {
    const idx = vowelIndices[i]
    const char = lowerWord[idx]
    // Prefer ă, â, ê, ô, ơ, ư (modified vowels) first
    if ('ăâêôơư'.includes(char)) {
      return idx
    }
  }
  
  // Then prefer a, e, o over i, u, y
  for (let i = 0; i < vowelIndices.length; i++) {
    const idx = vowelIndices[i]
    const char = lowerWord[idx]
    if ('aeo'.includes(char)) {
      return idx
    }
  }
  
  // Fallback to last vowel
  return vowelIndices[vowelIndices.length - 1]
}

/**
 * Find position of a character in the last word that can be modified
 */
const findCharToModify = (word: string, targetChars: string): number => {
  const lowerWord = word.toLowerCase()
  // Search from end to beginning
  for (let i = word.length - 1; i >= 0; i--) {
    if (targetChars.includes(lowerWord[i])) {
      return i
    }
  }
  return -1
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
      const { word: lastWord, startIndex: wordStartIndex } = getLastWord(currentValue)
      const beforeWord = currentValue.slice(0, wordStartIndex)

      if (inputMethod === 'telex') {
        // Check for tone marks (s, f, r, x, j)
        if (TELEX_TONES[lowerInput] && lastWord.length > 0) {
          const tone = TELEX_TONES[lowerInput]
          const vowelIdx = findVowelForTone(lastWord)
          
          if (vowelIdx !== -1) {
            const charToModify = lastWord[vowelIdx]
            const toneMap = VIETNAMESE_TONES[tone]
            if (toneMap && toneMap[charToModify]) {
              const modifiedWord = 
                lastWord.slice(0, vowelIdx) + 
                toneMap[charToModify] + 
                lastWord.slice(vowelIdx + 1)
              setBuffer('')
              return beforeWord + modifiedWord
            }
          }
        }

        // Check for vowel modifications (w, aa, ee, oo, dd)
        if (TELEX_VOWEL_MODS[lowerInput] && lastWord.length > 0) {
          // Special case for 'w' - can modify a->ă, o->ơ, u->ư
          // Find the target char in the word (not just last char)
          if (lowerInput === 'w') {
            // First check buffer for immediate aw, ow, uw pattern
            const lastCharLower = buffer.toLowerCase()
            if (lastCharLower === 'a') {
              // aw -> ă
              const isUpper = lastWord.slice(-1) === lastWord.slice(-1).toUpperCase() && lastWord.slice(-1).toLowerCase() === 'a'
              const modified = isUpper ? 'Ă' : 'ă'
              setBuffer(modified.toLowerCase())
              return currentValue.slice(0, -1) + modified
            } else if (lastCharLower === 'o') {
              // ow -> ơ
              const isUpper = lastWord.slice(-1) === lastWord.slice(-1).toUpperCase() && lastWord.slice(-1).toLowerCase() === 'o'
              const modified = isUpper ? 'Ơ' : 'ơ'
              setBuffer(modified.toLowerCase())
              return currentValue.slice(0, -1) + modified
            } else if (lastCharLower === 'u') {
              // uw -> ư
              const isUpper = lastWord.slice(-1) === lastWord.slice(-1).toUpperCase() && lastWord.slice(-1).toLowerCase() === 'u'
              const modified = isUpper ? 'Ư' : 'ư'
              setBuffer(modified.toLowerCase())
              return currentValue.slice(0, -1) + modified
            }
            
            // If not immediate, search in word for a, o, u to modify
            const charIdx = findCharToModify(lastWord, 'aou')
            if (charIdx !== -1) {
              const charToModify = lastWord[charIdx]
              const charLower = charToModify.toLowerCase()
              const isUpper = charToModify === charToModify.toUpperCase() && charLower !== charToModify
              
              let modified: string | null = null
              if (charLower === 'a') modified = isUpper ? 'Ă' : 'ă'
              else if (charLower === 'o') modified = isUpper ? 'Ơ' : 'ơ'
              else if (charLower === 'u') modified = isUpper ? 'Ư' : 'ư'
              
              if (modified) {
                const modifiedWord = 
                  lastWord.slice(0, charIdx) + 
                  modified + 
                  lastWord.slice(charIdx + 1)
                setBuffer('')
                return beforeWord + modifiedWord
              }
            }
          }
          
          // Check for 'd' key - dd pattern or find d in word
          if (lowerInput === 'd') {
            // First check buffer for immediate dd pattern
            if (buffer.toLowerCase() === 'd') {
              const charToReplace = currentValue.slice(-1)
              const isUpper = charToReplace === charToReplace.toUpperCase() && charToReplace.toLowerCase() === 'd'
              const modified = isUpper ? 'Đ' : 'đ'
              setBuffer(modified.toLowerCase())
              return currentValue.slice(0, -1) + modified
            }
            // If not immediate, search in word for d to modify
            const charIdx = findCharToModify(lastWord, 'd')
            if (charIdx !== -1) {
              const charToModify = lastWord[charIdx]
              const isUpper = charToModify === charToModify.toUpperCase() && charToModify.toLowerCase() === 'd'
              const modified = isUpper ? 'Đ' : 'đ'
              const modifiedWord = 
                lastWord.slice(0, charIdx) + 
                modified + 
                lastWord.slice(charIdx + 1)
              setBuffer(lowerInput)
              return beforeWord + modifiedWord
            }
          }
          
          // Check for double letter (aa, ee, oo)
          if (buffer.toLowerCase() === lowerInput && ['a', 'e', 'o'].includes(lowerInput)) {
            const charToReplace = currentValue.slice(-1)
            const isUpper = charToReplace === charToReplace.toUpperCase() && charToReplace.toLowerCase() === lowerInput
            
            let modified: string | null = null
            if (lowerInput === 'a') modified = isUpper ? 'Â' : 'â'
            else if (lowerInput === 'e') modified = isUpper ? 'Ê' : 'ê'
            else if (lowerInput === 'o') modified = isUpper ? 'Ô' : 'ô'
            
            if (modified) {
              setBuffer(modified.toLowerCase())
              return currentValue.slice(0, -1) + modified
            }
          }
        }
      } else {
        // VNI mode
        // Check for tone marks (1, 2, 3, 4, 5)
        if (VNI_TONES[lowerInput] && lastWord.length > 0) {
          const tone = VNI_TONES[lowerInput]
          const vowelIdx = findVowelForTone(lastWord)
          
          if (vowelIdx !== -1) {
            const charToModify = lastWord[vowelIdx]
            const toneMap = VIETNAMESE_TONES[tone]
            if (toneMap && toneMap[charToModify]) {
              const modifiedWord = 
                lastWord.slice(0, vowelIdx) + 
                toneMap[charToModify] + 
                lastWord.slice(vowelIdx + 1)
              setBuffer('')
              return beforeWord + modifiedWord
            }
          }
        }

        // Check for vowel modifications (6, 7, 8, 9)
        if (VNI_VOWEL_MODS[lowerInput] && lastWord.length > 0) {
          const modConfig = VNI_VOWEL_MODS[lowerInput]
          const charIdx = findCharToModify(lastWord, modConfig.target)
          
          if (charIdx !== -1) {
            const charToModify = lastWord[charIdx]
            const charLower = charToModify.toLowerCase()
            const isUpper = charToModify === charToModify.toUpperCase() && charLower !== charToModify
            
            let modified: string | null = null
            
            if (modConfig.type === 'circumflex') {
              // 6: a->â, e->ê, o->ô
              if (charLower === 'a') modified = isUpper ? 'Â' : 'â'
              else if (charLower === 'e') modified = isUpper ? 'Ê' : 'ê'
              else if (charLower === 'o') modified = isUpper ? 'Ô' : 'ô'
            } else if (modConfig.type === 'horn') {
              // 7: o->ơ, u->ư
              if (charLower === 'o') modified = isUpper ? 'Ơ' : 'ơ'
              else if (charLower === 'u') modified = isUpper ? 'Ư' : 'ư'
            } else if (modConfig.type === 'breve') {
              // 8: a->ă
              if (charLower === 'a') modified = isUpper ? 'Ă' : 'ă'
            } else if (modConfig.type === 'stroke') {
              // 9: d->đ
              if (charLower === 'd') modified = isUpper ? 'Đ' : 'đ'
            }
            
            if (modified) {
              const modifiedWord = 
                lastWord.slice(0, charIdx) + 
                modified + 
                lastWord.slice(charIdx + 1)
              setBuffer('')
              return beforeWord + modifiedWord
            }
          }
        }
      }

      // Regular character - just append
      setBuffer(lowerInput)
      return currentValue + input
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
