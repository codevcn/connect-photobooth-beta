# Vietnamese Virtual Keyboard

Bàn phím ảo tiếng Việt cho ứng dụng web, hỗ trợ đầy đủ cả 2 kiểu gõ **Telex** và **VNI**.

## 📦 Cài đặt

Đã được cài đặt sẵn các dependencies:
- `simple-keyboard`
- `react-simple-keyboard`

## 📁 Cấu trúc Files

```
src/
├── hooks/
│   └── use-vietnamese-keyboard.ts      # Hook xử lý logic gõ tiếng Việt
├── components/custom/
│   ├── VietnameseKeyboard.tsx          # Component bàn phím inline
│   ├── VietnameseKeyboardModal.tsx     # Component bàn phím dạng modal
│   └── VietnameseKeyboardDemo.tsx      # Demo & hướng dẫn sử dụng
```

## 🚀 Sử dụng

### 1. Inline Keyboard (Nhúng trực tiếp)

```tsx
import { VietnameseKeyboard } from '@/components/custom/VietnameseKeyboard'
import { useState } from 'react'

function MyComponent() {
  const [text, setText] = useState('')
  
  return (
    <VietnameseKeyboard
      onChange={(value) => setText(value)}
      inputValue={text}
      placeholder="Nhập văn bản tiếng Việt..."
      theme="light" // hoặc "dark"
      maxLength={200}
      autoFocus={true}
    />
  )
}
```

### 2. Modal Keyboard (Hiển thị dạng popup)

```tsx
import { VietnameseKeyboardModal } from '@/components/custom/VietnameseKeyboardModal'
import { useState } from 'react'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)
  const [text, setText] = useState('')
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Mở bàn phím ảo
      </button>
      
      <VietnameseKeyboardModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={(submittedText) => {
          setText(submittedText)
          console.log('Văn bản đã nhập:', submittedText)
        }}
        initialValue={text}
        title="Nhập văn bản tiếng Việt"
        placeholder="Gõ gì đó..."
        maxLength={300}
        theme="light"
      />
    </>
  )
}
```

### 3. Sử dụng Hook trực tiếp

```tsx
import { useVietnameseKeyboard } from '@/hooks/use-vietnamese-keyboard'
import { useState } from 'react'

function MyComponent() {
  const [text, setText] = useState('')
  const { 
    inputMethod,           // 'telex' | 'vni'
    toggleInputMethod,     // Chuyển đổi kiểu gõ
    processVietnameseInput, // Xử lý input character
    resetBuffer            // Reset buffer khi cần
  } = useVietnameseKeyboard()
  
  const handleKeyPress = (key: string) => {
    const newText = processVietnameseInput(key, text)
    setText(newText)
  }
  
  return (
    <div>
      <p>Kiểu gõ: {inputMethod.toUpperCase()}</p>
      <button onClick={toggleInputMethod}>
        Chuyển sang {inputMethod === 'telex' ? 'VNI' : 'Telex'}
      </button>
      <input 
        type="text" 
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  )
}
```

## 🎨 Props

### VietnameseKeyboard Props

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `onChange` | `(input: string) => void` | - | Callback khi text thay đổi |
| `onKeyPress` | `(button: string) => void` | - | Callback khi nhấn phím |
| `onClose` | `() => void` | - | Callback khi đóng keyboard |
| `inputValue` | `string` | `''` | Giá trị hiện tại |
| `placeholder` | `string` | `'Nhập văn bản...'` | Placeholder cho input |
| `theme` | `'light' \| 'dark'` | `'light'` | Theme màu sắc |
| `maxLength` | `number` | - | Giới hạn số ký tự |
| `autoFocus` | `boolean` | `true` | Tự động focus input |

### VietnameseKeyboardModal Props

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `isOpen` | `boolean` | - | Trạng thái hiển thị modal |
| `onClose` | `() => void` | - | Callback khi đóng modal |
| `onSubmit` | `(text: string) => void` | - | Callback khi submit text |
| `initialValue` | `string` | `''` | Giá trị khởi tạo |
| `title` | `string` | `'Nhập văn bản'` | Tiêu đề modal |
| `placeholder` | `string` | `'Nhập văn bản...'` | Placeholder |
| `maxLength` | `number` | - | Giới hạn số ký tự |
| `theme` | `'light' \| 'dark'` | `'light'` | Theme màu sắc |

## ⌨️ Bảng phím tắt

### Telex (Mặc định)

| Phím | Kết quả | Ví dụ |
|------|---------|-------|
| `aa` | â | `caan` → `cân` |
| `aw` | ă | `cawn` → `căn` |
| `ee` | ê | `teen` → `tên` |
| `oo` | ô | `coon` → `côn` |
| `ow` | ơ | `cow` → `cơ` |
| `uw` | ư | `tuw` → `tư` |
| `dd` | đ | `ddoo` → `đô` |
| `s` | Sắc (á) | `cas` → `cá` |
| `f` | Huyền (à) | `caf` → `cà` |
| `r` | Hỏi (ả) | `car` → `cả` |
| `x` | Ngã (ã) | `cax` → `cã` |
| `j` | Nặng (ạ) | `caj` → `cạ` |

### VNI

| Phím | Kết quả | Ví dụ |
|------|---------|-------|
| `a6` | â | `ca6n` → `cân` |
| `a8` | ă | `ca8n` → `căn` |
| `e6` | ê | `te6n` → `tên` |
| `o6` | ô | `co6n` → `côn` |
| `o7` | ơ | `co7` → `cơ` |
| `u7` | ư | `tu7` → `tư` |
| `d9` | đ | `d9o6` → `đô` |
| `1` | Sắc (á) | `ca1` → `cá` |
| `2` | Huyền (à) | `ca2` → `cà` |
| `3` | Hỏi (ả) | `ca3` → `cả` |
| `4` | Ngã (ã) | `ca4` → `cã` |
| `5` | Nặng (ạ) | `ca5` → `cạ` |

### Phím đặc biệt

| Phím | Chức năng |
|------|-----------|
| **Toggle** | Chuyển đổi giữa Telex/VNI |
| **⌫** | Xóa ký tự cuối |
| **🗑** | Xóa toàn bộ văn bản |
| **↵** | Enter (đóng modal và submit) |
| **✕** | Đóng keyboard/modal |
| **⇧** | Shift (chữ hoa) |
| **␣** | Space (khoảng trắng) |

## 🎯 Ví dụ gõ

### Telex
```
viet + s = viết
nam = nam
→ Việt Nam
```

### VNI
```
vie65t = viết
nam = nam
→ Việt Nam
```

## 🎨 Customization

Bạn có thể tùy chỉnh CSS trong các components hoặc override classes:

```css
/* Override keyboard button colors */
.vietnamese-keyboard .hg-button {
  background: your-color !important;
}

/* Override toggle button */
.vietnamese-keyboard .hg-button-toggle {
  background: linear-gradient(135deg, #your-color1 0%, #your-color2 100%) !important;
}
```

## 📱 Responsive

Bàn phím tự động responsive cho:
- Desktop (> 768px)
- Tablet (480px - 768px)
- Mobile (< 480px)

## 🧪 Demo

Để xem demo đầy đủ, import và sử dụng component demo:

```tsx
import VietnameseKeyboardDemo from '@/components/custom/VietnameseKeyboardDemo'

function App() {
  return <VietnameseKeyboardDemo />
}
```

Hoặc thêm route mới:

```tsx
// Trong App.tsx hoặc router config
<Route path="/keyboard-demo" element={<VietnameseKeyboardDemo />} />
```

## 🔧 Troubleshooting

### Bàn phím không hiển thị
- Kiểm tra CSS của `simple-keyboard` đã được import chưa
- Đảm bảo `react-simple-keyboard` được cài đặt đúng

### Gõ tiếng Việt không chính xác
- Kiểm tra inputMethod đang ở chế độ nào (Telex/VNI)
- Reset buffer khi chuyển input field: `resetBuffer()`

### Modal không đóng được
- Đảm bảo `onClose` prop được truyền vào
- Kiểm tra z-index không bị conflict

## 📝 Notes

- Hook `useVietnameseKeyboard` quản lý buffer để xử lý các tổ hợp phím
- Component tự động reset buffer khi chuyển đổi input method
- Hỗ trợ cả chữ hoa và chữ thường
- Modal sử dụng `createPortal` để render ra body

## 🤝 Contributing

Nếu cần thêm tính năng hoặc sửa lỗi, vui lòng tạo issue hoặc PR.

## 📄 License

MIT
