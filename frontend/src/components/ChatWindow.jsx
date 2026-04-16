import { useState, useRef, useEffect } from 'react'

const CODE_EXTENSIONS = ['js','jsx','ts','tsx','py','java','cpp','c','cs','go','rb','php','html','css','json','sql','rs','swift','kt','txt','md']

export default function ChatWindow() {
  const [messages, setMessages]           = useState([])
  const [input, setInput]                 = useState('')
  const [loading, setLoading]             = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview]   = useState(null)
  const [selectedCode, setSelectedCode]   = useState(null)
  const [codeFilename, setCodeFilename]   = useState('')
  const bottomRef = useRef(null)
  const fileRef   = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
      image: img, filename
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
        content: data.reply || data.error
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Something went wrong. Is the backend running?'
      }])
    }
    setLoading(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
      background: '#fafafa', overflow: 'hidden' }}>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px',
        display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {messages.length === 0 && <EmptyState />}

        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <Avatar label="OC" color="#6366f1" />
            <div style={{ background: '#fff', border: '0.5px solid #e5e5e5',
              borderRadius: '12px', borderBottomLeftRadius: '4px',
              padding: '12px 16px', display: 'flex', gap: '4px',
              alignItems: 'center' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#6366f1', opacity: 0.4,
                  animation: `bounce 1s ease-in-out ${i*0.15}s infinite`
                }}/>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* File preview */}
      {(imagePreview || codeFilename) && (
        <div style={{ padding: '0 24px 8px', display: 'flex',
          alignItems: 'center', gap: '8px' }}>
          {imagePreview && (
            <img src={imagePreview} alt="preview" style={{
              height: '56px', borderRadius: '8px',
              border: '0.5px solid #e5e5e5' }}
            />
          )}
          {codeFilename && (
            <div style={{ background: '#1e1e2e', color: '#a6e3a1',
              padding: '6px 12px', borderRadius: '6px',
              fontSize: '12px', fontFamily: 'monospace' }}>
              {codeFilename}
            </div>
          )}
          <button onClick={removeFile} style={{
            width: '22px', height: '22px', borderRadius: '50%',
            background: '#ef4444', color: '#fff', border: 'none',
            cursor: 'pointer', fontSize: '12px', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>x</button>
        </div>
      )}

      {/* Input bar */}
      <div style={{ padding: '12px 24px 16px', background: '#fff',
        borderTop: '0.5px solid #f0f0f0', display: 'flex',
        gap: '8px', alignItems: 'flex-end' }}>

        <input type="file"
          accept="image/*,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.go,.rb,.php,.html,.css,.json,.sql"
          ref={fileRef} onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <button onClick={() => fileRef.current.click()} style={{
          width: '36px', height: '36px', border: '0.5px solid #e5e5e5',
          borderRadius: '8px', background: '#fff', cursor: 'pointer',
          color: '#666', fontSize: '18px', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>+</button>

        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedCode   ? `Ask about ${codeFilename}...` :
            selectedImage  ? 'Ask about the image...' :
            'Ask anything about your workspace...'
          }
          rows={1}
          style={{
            flex: 1, padding: '8px 14px', borderRadius: '8px',
            border: '0.5px solid #e5e5e5', fontSize: '14px',
            resize: 'none', outline: 'none', fontFamily: 'inherit',
            lineHeight: '1.5', background: '#fff', color: '#111'
          }}
        />

        <button onClick={sendMessage} disabled={loading} style={{
          height: '36px', padding: '0 18px', background: loading ? '#a5b4fc' : '#6366f1',
          color: '#fff', border: 'none', borderRadius: '8px',
          fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: '500', flexShrink: 0, transition: 'background 0.15s'
        }}>Send</button>
      </div>

      <style>{`
        @keyframes bounce {
          0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)}
        }
      `}</style>
    </div>
  )
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display: 'flex', gap: '10px',
      alignItems: 'flex-end', flexDirection: isUser ? 'row-reverse' : 'row' }}>
      <Avatar label={isUser ? 'P' : 'OC'} color={isUser ? '#e5e7eb' : '#6366f1'}
        textColor={isUser ? '#374151' : '#fff'} />
      <div style={{ maxWidth: '72%', display: 'flex',
        flexDirection: 'column', gap: '4px',
        alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        {!isUser && (
          <span style={{ fontSize: '11px', color: '#6366f1',
            fontWeight: '500', paddingLeft: '4px' }}>
            Omni Copilot
          </span>
        )}
        {msg.image && (
          <img src={msg.image} alt="upload" style={{
            maxWidth: '100%', maxHeight: '180px', borderRadius: '8px',
            border: '0.5px solid #e5e5e5', objectFit: 'cover'
          }}/>
        )}
        {msg.filename && (
          <div style={{ background: '#1e1e2e', color: '#a6e3a1',
            padding: '5px 10px', borderRadius: '6px',
            fontSize: '12px', fontFamily: 'monospace' }}>
            {msg.filename}
          </div>
        )}
        <div style={{
          padding: '10px 14px', borderRadius: '12px', fontSize: '14px',
          lineHeight: '1.6', whiteSpace: 'pre-wrap',
          borderBottomLeftRadius: isUser ? '12px' : '4px',
          borderBottomRightRadius: isUser ? '4px' : '12px',
          background: isUser ? '#6366f1' : '#fff',
          color: isUser ? '#fff' : '#111',
          border: isUser ? 'none' : '0.5px solid #e5e5e5'
        }}>
          {msg.content}
        </div>
      </div>
    </div>
  )
}

function Avatar({ label, color, textColor = '#fff' }) {
  return (
    <div style={{
      width: '28px', height: '28px', borderRadius: '50%',
      background: color, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: '11px', fontWeight: '600',
      color: textColor, flexShrink: 0
    }}>{label}</div>
  )
}

function EmptyState() {
  const suggestions = [
    'Find my resume in Drive',
    'Show unread emails',
    'What meetings do I have today?',
    'Search my Notion notes'
  ]
  return (
    <div style={{ margin: 'auto', textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ width: '48px', height: '48px', background: '#6366f1',
        borderRadius: '14px', margin: '0 auto 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '22px', color: '#fff', fontWeight: '700' }}>O</div>
      <div style={{ fontSize: '18px', fontWeight: '500',
        color: '#111', marginBottom: '8px' }}>
        Omni Copilot
      </div>
      <div style={{ fontSize: '14px', color: '#999', marginBottom: '24px' }}>
        Your entire workspace in one chat
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap',
        gap: '8px', justifyContent: 'center', maxWidth: '400px', margin: '0 auto' }}>
        {suggestions.map(s => (
          <button key={s}
            onClick={() => document.querySelector('textarea').value = s}
            style={{
              padding: '7px 14px', borderRadius: '20px', fontSize: '13px',
              border: '0.5px solid #e5e5e5', background: '#fff',
              color: '#555', cursor: 'pointer'
            }}>{s}</button>
        ))}
      </div>
    </div>
  )
}