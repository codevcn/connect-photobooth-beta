import { useState } from 'react'
import { VietnameseKeyboard } from '@/components/custom/virtual-keyboard/VietnameseKeyboard'
import { VietnameseKeyboardModal } from '@/components/custom/virtual-keyboard/VietnameseKeyboardModal'

/**
 * Demo component để test Vietnamese Keyboard
 * 
 * Cách sử dụng:
 * 1. Import component hoặc modal
 * 2. Sử dụng như examples dưới đây
 */
export const VietnameseKeyboardDemo = () => {
  const [text, setText] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalText, setModalText] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  return (
    <div className={`demo-container ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <div className="demo-header">
        <h1>Vietnamese Virtual Keyboard Demo</h1>
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="theme-toggle-btn"
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>

      {/* Example 1: Inline Keyboard */}
      <div className="demo-section">
        <h2>Example 1: Inline Keyboard</h2>
        <p className="description">
          Bàn phím được nhúng trực tiếp vào trang, hỗ trợ Telex và VNI
        </p>
        <VietnameseKeyboard
          onChange={(value) => setText(value)}
          inputValue={text}
          placeholder="Nhập văn bản tiếng Việt..."
          theme={theme}
          maxLength={200}
        />
        <div className="output-box">
          <h3>Output:</h3>
          <div className="output-text">{text || '(Chưa có nội dung)'}</div>
        </div>
      </div>

      {/* Example 2: Modal Keyboard */}
      <div className="demo-section">
        <h2>Example 2: Modal Keyboard</h2>
        <p className="description">
          Bàn phím hiển thị trong modal, phù hợp cho form inputs
        </p>
        <button onClick={() => setIsModalOpen(true)} className="open-keyboard-btn">
          📝 Mở bàn phím ảo
        </button>
        {modalText && (
          <div className="output-box">
            <h3>Văn bản đã nhập:</h3>
            <div className="output-text">{modalText}</div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="demo-section instructions">
        <h2>Hướng dẫn sử dụng</h2>
        <div className="instruction-grid">
          <div className="instruction-card">
            <h3>Telex (Mặc định)</h3>
            <ul>
              <li><code>aa</code> → â</li>
              <li><code>aw</code> → ă</li>
              <li><code>ee</code> → ê</li>
              <li><code>oo</code> → ô</li>
              <li><code>ow</code> → ơ</li>
              <li><code>uw</code> → ư</li>
              <li><code>dd</code> → đ</li>
              <li><code>s</code> → dấu sắc</li>
              <li><code>f</code> → dấu huyền</li>
              <li><code>r</code> → dấu hỏi</li>
              <li><code>x</code> → dấu ngã</li>
              <li><code>j</code> → dấu nặng</li>
            </ul>
          </div>
          <div className="instruction-card">
            <h3>VNI</h3>
            <ul>
              <li><code>a6</code> → â</li>
              <li><code>a8</code> → ă</li>
              <li><code>e6</code> → ê</li>
              <li><code>o6</code> → ô</li>
              <li><code>o7</code> → ơ</li>
              <li><code>u7</code> → ư</li>
              <li><code>d9</code> → đ</li>
              <li><code>1</code> → dấu sắc</li>
              <li><code>2</code> → dấu huyền</li>
              <li><code>3</code> → dấu hỏi</li>
              <li><code>4</code> → dấu ngã</li>
              <li><code>5</code> → dấu nặng</li>
            </ul>
          </div>
          <div className="instruction-card">
            <h3>Phím đặc biệt</h3>
            <ul>
              <li><strong>Toggle:</strong> Chuyển đổi Telex/VNI</li>
              <li><strong>⌫:</strong> Xóa ký tự</li>
              <li><strong>🗑:</strong> Xóa toàn bộ</li>
              <li><strong>↵:</strong> Xác nhận (đóng modal)</li>
              <li><strong>✕:</strong> Đóng</li>
              <li><strong>⇧:</strong> Shift (chữ hoa)</li>
              <li><strong>␣:</strong> Space</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div className="demo-section code-examples">
        <h2>Code Examples</h2>
        <div className="code-block">
          <h3>1. Sử dụng Inline Keyboard:</h3>
          <pre>{`import { VietnameseKeyboard } from '@/components/custom/VietnameseKeyboard'

function MyComponent() {
  const [text, setText] = useState('')
  
  return (
    <VietnameseKeyboard
      onChange={(value) => setText(value)}
      inputValue={text}
      placeholder="Nhập văn bản..."
      theme="light"
      maxLength={200}
    />
  )
}`}</pre>
        </div>

        <div className="code-block">
          <h3>2. Sử dụng Modal Keyboard:</h3>
          <pre>{`import { VietnameseKeyboardModal } from '@/components/custom/VietnameseKeyboardModal'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)
  const [text, setText] = useState('')
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Mở bàn phím
      </button>
      
      <VietnameseKeyboardModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={(text) => setText(text)}
        initialValue={text}
        title="Nhập văn bản"
        maxLength={200}
      />
    </>
  )
}`}</pre>
        </div>

        <div className="code-block">
          <h3>3. Sử dụng Hook:</h3>
          <pre>{`import { useVietnameseKeyboard } from '@/hooks/use-vietnamese-keyboard'

function MyComponent() {
  const { 
    inputMethod, 
    toggleInputMethod, 
    processVietnameseInput 
  } = useVietnameseKeyboard()
  
  // inputMethod: 'telex' | 'vni'
  // toggleInputMethod(): chuyển đổi kiểu gõ
  // processVietnameseInput(char, currentValue): xử lý input
}`}</pre>
        </div>
      </div>

      <VietnameseKeyboardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(text) => setModalText(text)}
        initialValue={modalText}
        title="Nhập văn bản tiếng Việt"
        placeholder="Gõ gì đó..."
        maxLength={300}
        theme={theme}
      />

      <style>{`
        .demo-container {
          min-height: 100vh;
          padding: 40px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .demo-container.dark-mode {
          background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
        }

        .demo-header {
          text-align: center;
          margin-bottom: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .demo-header h1 {
          color: white;
          font-size: 36px;
          font-weight: 800;
          margin: 0;
        }

        .theme-toggle-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid white;
          color: white;
          padding: 10px 20px;
          border-radius: 50px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.3s;
        }

        .theme-toggle-btn:hover {
          background: white;
          color: #667eea;
        }

        .demo-section {
          background: white;
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .dark-mode .demo-section {
          background: #2d3748;
          color: white;
        }

        .demo-section h2 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 12px 0;
          color: #2d3748;
        }

        .dark-mode .demo-section h2 {
          color: white;
        }

        .description {
          color: #718096;
          margin-bottom: 24px;
          font-size: 16px;
        }

        .dark-mode .description {
          color: #a0aec0;
        }

        .output-box {
          margin-top: 24px;
          padding: 20px;
          background: #f7fafc;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
        }

        .dark-mode .output-box {
          background: #1a202c;
          border-color: #4a5568;
        }

        .output-box h3 {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
        }

        .dark-mode .output-box h3 {
          color: white;
        }

        .output-text {
          font-size: 16px;
          color: #2d3748;
          line-height: 1.6;
          min-height: 24px;
        }

        .dark-mode .output-text {
          color: white;
        }

        .open-keyboard-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
        }

        .open-keyboard-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 30px rgba(102, 126, 234, 0.6);
        }

        .open-keyboard-btn:active {
          transform: translateY(0);
        }

        .instructions {
          background: linear-gradient(135deg, #f6f8fb 0%, #ffffff 100%);
        }

        .dark-mode .instructions {
          background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
        }

        .instruction-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .instruction-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
        }

        .dark-mode .instruction-card {
          background: #4a5568;
          border-color: #2d3748;
        }

        .instruction-card h3 {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 16px 0;
          color: #667eea;
        }

        .dark-mode .instruction-card h3 {
          color: #90cdf4;
        }

        .instruction-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .instruction-card li {
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
          font-size: 14px;
        }

        .dark-mode .instruction-card li {
          border-bottom-color: #2d3748;
        }

        .instruction-card li:last-child {
          border-bottom: none;
        }

        .instruction-card code {
          background: #f7fafc;
          padding: 2px 8px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-weight: 600;
          color: #e53e3e;
        }

        .dark-mode .instruction-card code {
          background: #2d3748;
          color: #fc8181;
        }

        .code-examples {
          background: #1a202c;
          color: white;
        }

        .code-block {
          margin-bottom: 24px;
        }

        .code-block:last-child {
          margin-bottom: 0;
        }

        .code-block h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 12px 0;
          color: #90cdf4;
        }

        .code-block pre {
          background: #2d3748;
          padding: 20px;
          border-radius: 8px;
          overflow-x: auto;
          font-size: 14px;
          line-height: 1.6;
          color: #e2e8f0;
          font-family: 'Courier New', monospace;
          border: 1px solid #4a5568;
        }

        @media (max-width: 768px) {
          .demo-container {
            padding: 20px 12px;
          }

          .demo-header h1 {
            font-size: 24px;
          }

          .demo-section {
            padding: 20px;
          }

          .demo-section h2 {
            font-size: 22px;
          }

          .instruction-grid {
            grid-template-columns: 1fr;
          }

          .code-block pre {
            font-size: 12px;
            padding: 16px;
          }
        }
      `}</style>
    </div>
  )
}

export default VietnameseKeyboardDemo
