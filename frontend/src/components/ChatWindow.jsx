import { useState, useRef, useEffect, useMemo } from 'react'

const CODE_EXTENSIONS = ['js','jsx','ts','tsx','py','java','cpp','c','cs','go','rb','php','html','css','json','sql','rs','swift','kt','txt','md']

/* ── Floating particle background ── */
function ParticleField() {
  const particles = useMemo(() => (
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      dx: (Math.random() - 0.5) * 40,
      dy: (Math.random() - 0.5) * 40,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 6,
      opacity: Math.random() * 0.25 + 0.08,
    }))
  ), [])

  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
    }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: `${p.size}px`,
          height: `${p.size}px`,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(99,102,241,${p.opacity * 2}) 0%, rgba(139,92,246,${p.opacity}) 100%)`,
          '--dx': `${p.dx}px`,
          '--dy': `${p.dy}px`,
          animation: `particle-drift ${p.duration}s ease-in-out ${p.delay}s infinite`,
        }} />
      ))}
      <style>{`
        @keyframes particle-drift {
          0%   { transform: translate(0, 0) scale(1);   opacity: var(--op, 0.4); }
          50%  { transform: translate(var(--dx), var(--dy)) scale(1.4); opacity: calc(var(--op, 0.4) * 0.5); }
          100% { transform: translate(0, 0) scale(1);   opacity: var(--op, 0.4); }
        }
      `}</style>
    </div>
  )
}

/* ── Main component ── */
export default function ChatWindow() {
  const [messages, setMessages]           = useState([])
  const [input, setInput]                 = useState('')
  const [loading, setLoading]             = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview]   = useState(null)
  const [selectedCode, setSelectedCode]   = useState(null)
  const [codeFilename, setCodeFilename]   = useState('')
  const [inputFocused, setInputFocused]   = useState(false)
  const bottomRef = useRef(null)
  const fileRef   = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()

    if (['jpg','jpeg','png','gif','webp'].includes(ext)) {
      setSelectedCode(null); setCodeFilename('')
      setImagePreview(URL.createObjectURL(file))
      const r = new FileReader()
      r.onload = () => setSelectedImage(r.result)
      r.readAsDataURL(file)
    } else if (CODE_EXTENSIONS.includes(ext)) {
      setSelectedImage(null); setImagePreview(null)
      setCodeFilename(file.name)
      const r = new FileReader()
      r.onload = (e) => setSelectedCode(e.target.result)
      r.readAsText(file)
    }
    fileRef.current.value = ''
  }

  function removeFile() {
    setSelectedImage(null); setImagePreview(null)
    setSelectedCode(null); setCodeFilename('')
  }

  async function sendMessage() {
    if ((!input.trim() && !selectedImage && !selectedCode) || loading) return

    const userMsg  = input.trim()
    const img      = selectedImage
    const code     = selectedCode
    const filename = codeFilename

    setInput(''); removeFile(); setLoading(true)

    setMessages(prev => [...prev, {
      role: 'user',
      content: userMsg || (img ? 'Analyze this image' : `Analyze ${filename}`),
      image: img, filename,
      id: Date.now(),
    }])

    try {
      const res  = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg || (img ? 'Describe this image.' : `Analyze ${filename}`),
          image: img, code, filename
        })
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || data.error,
        id: Date.now(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Something went wrong. Is the backend running?',
        id: Date.now(),
      }])
    }
    setLoading(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  function handleSuggestion(text) {
    setInput(text)
    textareaRef.current?.focus()
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: '#fafafa',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <ParticleField />

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
        zIndex: 1,
      }}>
        {messages.length === 0 && <EmptyState onSuggestion={handleSuggestion} />}

        {messages.map((msg, i) => (
          <MessageBubble key={msg.id ?? i} msg={msg} index={i} />
        ))}

        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* File preview strip */}
      {(imagePreview || codeFilename) && (
        <div style={{
          padding: '0 24px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeSlideUp 0.25s cubic-bezier(0.22,1,0.36,1) both',
          position: 'relative',
          zIndex: 1,
        }}>
          {imagePreview && (
            <img src={imagePreview} alt="preview" style={{
              height: '56px',
              borderRadius: '8px',
              border: '0.5px solid #e5e5e5',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }} />
          )}
          {codeFilename && (
            <div style={{
              background: '#1e1e2e',
              color: '#a6e3a1',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'monospace',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}>
              📄 {codeFilename}
            </div>
          )}
          <button onClick={removeFile} style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.2) rotate(90deg)'; e.currentTarget.style.background = '#dc2626' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) rotate(0deg)'; e.currentTarget.style.background = '#ef4444' }}
          >✕</button>
        </div>
      )}

      {/* Input bar */}
      <InputBar
        input={input}
        setInput={setInput}
        loading={loading}
        focused={inputFocused}
        setFocused={setInputFocused}
        onSend={sendMessage}
        onKeyDown={handleKeyDown}
        fileRef={fileRef}
        textareaRef={textareaRef}
        onFileClick={() => fileRef.current.click()}
        onFileSelect={handleFileSelect}
        selectedCode={selectedCode}
        codeFilename={codeFilename}
        selectedImage={selectedImage}
      />

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideRight {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlideLeft {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes ripple {
          0%   { transform: scale(0); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer-badge {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
      `}</style>
    </div>
  )
}

/* ── Input bar ── */
function InputBar({ input, setInput, loading, focused, setFocused, onSend, onKeyDown,
  fileRef, textareaRef, onFileClick, onFileSelect, selectedCode, codeFilename, selectedImage }) {

  const [sendHovered, setSendHovered] = useState(false)
  const [attachHovered, setAttachHovered] = useState(false)

  return (
    <div style={{
      padding: '12px 24px 16px',
      background: '#fff',
      borderTop: focused
        ? '0.5px solid rgba(99,102,241,0.4)'
        : '0.5px solid #f0f0f0',
      display: 'flex',
      gap: '8px',
      alignItems: 'flex-end',
      position: 'relative',
      zIndex: 1,
      transition: 'border-color 0.2s ease',
      boxShadow: focused
        ? '0 -4px 20px rgba(99,102,241,0.06)'
        : '0 -2px 8px rgba(0,0,0,0.02)',
    }}>
      <input
        type="file"
        accept="image/*,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.go,.rb,.php,.html,.css,.json,.sql"
        ref={fileRef}
        onChange={onFileSelect}
        style={{ display: 'none' }}
      />

      {/* Attach button */}
      <button
        onClick={onFileClick}
        onMouseEnter={() => setAttachHovered(true)}
        onMouseLeave={() => setAttachHovered(false)}
        style={{
          width: '36px',
          height: '36px',
          border: attachHovered ? '0.5px solid rgba(99,102,241,0.5)' : '0.5px solid #e5e5e5',
          borderRadius: '9px',
          background: attachHovered ? 'rgba(99,102,241,0.06)' : '#fff',
          cursor: 'pointer',
          color: attachHovered ? '#6366f1' : '#888',
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          transform: attachHovered ? 'scale(1.08) rotate(-5deg)' : 'scale(1) rotate(0deg)',
        }}
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
        </svg>
      </button>

      {/* Textarea */}
      <div style={{ flex: 1, position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={
            selectedCode   ? `Ask about ${codeFilename}...` :
            selectedImage  ? 'Ask about the image...' :
            'Ask anything about your workspace...'
          }
          rows={1}
          style={{
            width: '100%',
            padding: '8px 14px',
            borderRadius: '9px',
            border: focused
              ? '0.5px solid rgba(99,102,241,0.5)'
              : '0.5px solid #e5e5e5',
            fontSize: '14px',
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            lineHeight: '1.5',
            background: '#fff',
            color: '#111',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            boxShadow: focused
              ? '0 0 0 3px rgba(99,102,241,0.1)'
              : 'none',
          }}
        />
      </div>

      {/* Send button */}
      <button
        onClick={onSend}
        disabled={loading}
        onMouseEnter={() => setSendHovered(true)}
        onMouseLeave={() => setSendHovered(false)}
        style={{
          height: '36px',
          padding: '0 18px',
          background: loading
            ? '#a5b4fc'
            : sendHovered
              ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
              : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '9px',
          fontSize: '14px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: '600',
          flexShrink: 0,
          transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          transform: sendHovered && !loading ? 'translateY(-1px) scale(1.03)' : 'translateY(0) scale(1)',
          boxShadow: sendHovered && !loading
            ? '0 4px 16px rgba(99,102,241,0.4)'
            : '0 2px 6px rgba(99,102,241,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          minWidth: '72px',
          justifyContent: 'center',
        }}
      >
        {loading ? (
          <div style={{
            width: '14px',
            height: '14px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }} />
        ) : (
          <>
            Send
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </>
        )}
      </button>
    </div>
  )
}

/* ── Message bubble ── */
function MessageBubble({ msg, index }) {
  const isUser = msg.role === 'user'
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      alignItems: 'flex-end',
      flexDirection: isUser ? 'row-reverse' : 'row',
      opacity: visible ? 1 : 0,
      transform: visible
        ? 'translateY(0)'
        : isUser ? 'translateX(12px)' : 'translateX(-12px)',
      transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1)',
    }}>
      <Avatar label={isUser ? 'P' : 'OC'} color={isUser ? '#e5e7eb' : '#6366f1'}
        textColor={isUser ? '#374151' : '#fff'} isAI={!isUser} />

      <div style={{
        maxWidth: '72%',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        alignItems: isUser ? 'flex-end' : 'flex-start',
      }}>
        {!isUser && (
          <span style={{
            fontSize: '11px',
            fontWeight: '600',
            paddingLeft: '4px',
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Omni Copilot
          </span>
        )}

        {msg.image && (
          <img src={msg.image} alt="upload" style={{
            maxWidth: '100%',
            maxHeight: '180px',
            borderRadius: '10px',
            border: '0.5px solid #e5e5e5',
            objectFit: 'cover',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }} />
        )}
        {msg.filename && (
          <div style={{
            background: '#1e1e2e',
            color: '#a6e3a1',
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: 'monospace',
          }}>
            📄 {msg.filename}
          </div>
        )}

        <BubbleContent isUser={isUser} content={msg.content} />
      </div>
    </div>
  )
}

function BubbleContent({ isUser, content }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '10px 14px',
        borderRadius: '14px',
        fontSize: '14px',
        lineHeight: '1.65',
        whiteSpace: 'pre-wrap',
        borderBottomLeftRadius: isUser ? '14px' : '4px',
        borderBottomRightRadius: isUser ? '4px' : '14px',
        background: isUser
          ? 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)'
          : '#fff',
        color: isUser ? '#fff' : '#111',
        border: isUser ? 'none' : '0.5px solid #e8e8e8',
        boxShadow: isUser
          ? hovered
            ? '0 6px 20px rgba(99,102,241,0.35)'
            : '0 2px 10px rgba(99,102,241,0.2)'
          : hovered
            ? '0 4px 16px rgba(0,0,0,0.08)'
            : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.25s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        cursor: 'default',
      }}
    >
      {content}
    </div>
  )
}

/* ── Typing indicator ── */
function TypingIndicator() {
  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      alignItems: 'flex-end',
      animation: 'fadeSlideUp 0.3s cubic-bezier(0.22,1,0.36,1) both',
    }}>
      <Avatar label="OC" color="#6366f1" isAI />
      <div style={{
        background: '#fff',
        border: '0.5px solid #e8e8e8',
        borderRadius: '14px',
        borderBottomLeftRadius: '4px',
        padding: '12px 16px',
        display: 'flex',
        gap: '5px',
        alignItems: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, #6366f1, #8b5cf6)`,
            animation: `bounce 1.1s ease-in-out ${i * 0.18}s infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}

/* ── Avatar ── */
function Avatar({ label, color, textColor = '#fff', isAI = false }) {
  return (
    <div style={{
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      background: isAI
        ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
        : color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '11px',
      fontWeight: '700',
      color: textColor,
      flexShrink: 0,
      boxShadow: isAI
        ? '0 0 0 2px rgba(99,102,241,0.2), 0 2px 8px rgba(99,102,241,0.25)'
        : '0 1px 4px rgba(0,0,0,0.1)',
    }}>
      {label}
    </div>
  )
}

/* ── Empty state ── */
function EmptyState({ onSuggestion }) {
  const suggestions = [
    { text: 'Find my resume in Drive',    icon: '📁' },
    { text: 'Show unread emails',          icon: '📧' },
    { text: 'What meetings do I have today?', icon: '📅' },
    { text: 'Search my Notion notes',      icon: '📝' },
  ]

  return (
    <div style={{
      margin: 'auto',
      textAlign: 'center',
      padding: '40px 20px',
      animation: 'fadeSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) both',
    }}>
      {/* Animated logo */}
      <div style={{
        width: '56px',
        height: '56px',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        borderRadius: '16px',
        margin: '0 auto 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        color: '#fff',
        fontWeight: '800',
        boxShadow: '0 0 0 0 rgba(99,102,241,0.4)',
        animation: 'logo-pulse 3s ease-in-out infinite, float 5s ease-in-out infinite',
      }}>
        O
      </div>

      <div style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#111',
        marginBottom: '8px',
        background: 'linear-gradient(90deg, #111 0%, #6366f1 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        Omni Copilot
      </div>
      <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '28px' }}>
        Your entire workspace in one chat
      </div>

      {/* Suggestion chips */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        justifyContent: 'center',
        maxWidth: '420px',
        margin: '0 auto',
      }}>
        {suggestions.map((s, i) => (
          <SuggestionChip key={s.text} suggestion={s} delay={i * 0.07} onSelect={onSuggestion} />
        ))}
      </div>

      <style>{`
        @keyframes logo-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
          50%       { box-shadow: 0 0 0 10px rgba(99,102,241,0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}

function SuggestionChip({ suggestion, delay, onSelect }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={() => onSelect(suggestion.text)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '8px 16px',
        borderRadius: '22px',
        fontSize: '13px',
        border: hovered ? '0.5px solid rgba(99,102,241,0.4)' : '0.5px solid #e5e5e5',
        background: hovered ? 'rgba(99,102,241,0.06)' : '#fff',
        color: hovered ? '#6366f1' : '#555',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: hovered ? '500' : '400',
        transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'translateY(-2px) scale(1.04)' : 'translateY(0) scale(1)',
        boxShadow: hovered ? '0 4px 14px rgba(99,102,241,0.15)' : 'none',
        animation: `fadeSlideUp 0.4s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
      }}
    >
      <span>{suggestion.icon}</span>
      {suggestion.text}
    </button>
  )
}
