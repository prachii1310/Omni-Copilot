import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'

export default function App() {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (window.location.search.includes('connected=true')) {
      setConnected(true)
      window.history.replaceState({}, '', '/')
    }
  }, [])

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: '#fafafa',
      overflow: 'hidden'
    }}>
      <Sidebar connected={connected} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar />
        <ChatWindow />
      </div>
    </div>
  )
}

function TopBar() {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const agents = [
    { label: 'Drive',    bg: '#e0f2fe', color: '#0369a1' },
    { label: 'Gmail',    bg: '#fce7f3', color: '#9d174d' },
    { label: 'Calendar', bg: '#fef3c7', color: '#92400e' },
    { label: 'Notion',   bg: '#ede9fe', color: '#5b21b6' },
  ]

  return (
    <div style={{
      padding: '14px 24px',
      borderBottom: '0.5px solid #f0f0f0',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div>
        <div style={{ fontSize: '15px', fontWeight: '500', color: '#111' }}>{greeting}</div>
        <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>What do you need today?</div>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {agents.map(a => (
          <span key={a.label} style={{
            padding: '3px 10px', borderRadius: '20px',
            fontSize: '11px', fontWeight: '500',
            background: a.bg, color: a.color
          }}>{a.label}</span>
        ))}
      </div>
    </div>
  )
}