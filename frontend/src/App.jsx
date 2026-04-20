import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'

export default function App() {
  const [connected, setConnected] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (window.location.search.includes('connected=true')) {
      setConnected(true)
      window.history.replaceState({}, '', '/')
    }
    // Trigger mount animation
    requestAnimationFrame(() => setMounted(true))
  }, [])

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: '#fafafa',
      overflow: 'hidden',
      opacity: mounted ? 1 : 0,
      transition: 'opacity 0.4s ease',
    }}>
      <Sidebar connected={connected} />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        animation: 'fadeSlideDown 0.45s cubic-bezier(0.22,1,0.36,1) both',
        animationDelay: '0.1s',
      }}>
        <TopBar />
        <ChatWindow />
      </div>

      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

function TopBar() {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const agents = [
    { label: 'Drive',    bg: '#e0f2fe', color: '#0369a1', glow: 'rgba(3,105,161,0.25)' },
    { label: 'Gmail',    bg: '#fce7f3', color: '#9d174d', glow: 'rgba(157,23,77,0.25)' },
    { label: 'Calendar', bg: '#fef3c7', color: '#92400e', glow: 'rgba(146,64,14,0.25)' },
    { label: 'Notion',   bg: '#ede9fe', color: '#5b21b6', glow: 'rgba(91,33,182,0.25)' },
  ]

  return (
    <div style={{
      padding: '14px 24px',
      borderBottom: '0.5px solid #f0f0f0',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div>
        <div style={{
          fontSize: '15px', fontWeight: '600', color: '#111',
          background: 'linear-gradient(90deg, #111 0%, #6366f1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {greeting}
        </div>
        <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
          What do you need today?
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px' }}>
        {agents.map((a, i) => (
          <AgentBadge key={a.label} agent={a} delay={i * 0.06} />
        ))}
      </div>
    </div>
  )
}

function AgentBadge({ agent, delay }) {
  const [hovered, setHovered] = useState(false)

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '600',
        background: agent.bg,
        color: agent.color,
        cursor: 'default',
        display: 'inline-block',
        transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease',
        transform: hovered ? 'translateY(-2px) scale(1.06)' : 'translateY(0) scale(1)',
        boxShadow: hovered ? `0 4px 12px ${agent.glow}` : 'none',
        animation: `fadeSlideUp 0.4s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
      }}
    >
      {agent.label}
    </span>
  )
}
