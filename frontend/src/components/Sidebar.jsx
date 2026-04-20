import { useState, useEffect } from 'react'

export default function Sidebar({ connected }) {
  const [activeItem, setActiveItem] = useState('Chat')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
  }, [])

  const navItems = [
    { label: 'Chat',     icon: ChatIcon },
    { label: 'Drive',    icon: FolderIcon },
    { label: 'Gmail',    icon: MailIcon },
    { label: 'Calendar', icon: CalendarIcon },
    { label: 'Notion',   icon: NoteIcon },
    { label: 'Code',     icon: CodeIcon },
  ]

  return (
    <div style={{
      width: '220px',
      background: 'linear-gradient(180deg, #0d0d1f 0%, #0f0f1a 60%, #0a0a14 100%)',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      gap: '4px',
      flexShrink: 0,
      position: 'relative',
      overflow: 'hidden',
      borderRight: '0.5px solid #ffffff08',
    }}>

      {/* Ambient glow orb */}
      <div style={{
        position: 'absolute',
        top: '-60px',
        left: '-40px',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
        animation: 'float 6s ease-in-out infinite',
      }} />

      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 4px 16px',
        borderBottom: '0.5px solid #ffffff12',
        marginBottom: '8px',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(-8px)',
        transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)',
      }}>
        <LogoMark />
        <span style={{
          color: '#fff',
          fontSize: '15px',
          fontWeight: '700',
          letterSpacing: '-0.3px',
          background: 'linear-gradient(90deg, #fff 0%, #a5b4fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Omni Copilot
        </span>
      </div>

      {/* Nav items */}
      {navItems.map((item, i) => (
        <NavItem
          key={item.label}
          item={item}
          active={activeItem === item.label}
          onClick={() => setActiveItem(item.label)}
          delay={i * 0.05 + 0.1}
          mounted={mounted}
        />
      ))}

      {/* Bottom status */}
      <div style={{
        marginTop: 'auto',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.5s ease 0.5s, transform 0.5s cubic-bezier(0.22,1,0.36,1) 0.5s',
      }}>
        {connected ? (
          <ConnectedBadge />
        ) : (
          <ConnectButton />
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-10px) rotate(1deg); }
          66%       { transform: translateY(5px) rotate(-1deg); }
        }
        @keyframes logo-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.5), inset 0 0 0 0 rgba(255,255,255,0.1); }
          50%       { box-shadow: 0 0 0 6px rgba(99,102,241,0), inset 0 0 8px rgba(255,255,255,0.15); }
        }
        @keyframes status-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}

function LogoMark() {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '30px',
        height: '30px',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        borderRadius: '9px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        color: '#fff',
        fontWeight: '800',
        flexShrink: 0,
        animation: 'logo-pulse 3s ease-in-out infinite',
        transform: hovered ? 'rotate(-8deg) scale(1.1)' : 'rotate(0deg) scale(1)',
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        cursor: 'default',
      }}
    >
      O
    </div>
  )
}

function NavItem({ item, active, onClick, delay, mounted }) {
  const [hovered, setHovered] = useState(false)
  const [ripples, setRipples] = useState([])

  function handleClick(e) {
    onClick()
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()
    setRipples(r => [...r, { id, x, y }])
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 600)
  }

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '9px 10px',
        borderRadius: '9px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        background: active
          ? 'linear-gradient(90deg, rgba(99,102,241,0.25) 0%, rgba(99,102,241,0.08) 100%)'
          : hovered
            ? 'rgba(255,255,255,0.06)'
            : 'transparent',
        color: active ? '#a5b4fc' : hovered ? '#ffffffcc' : '#ffffff60',
        fontSize: '13px',
        fontWeight: active ? '600' : '400',
        borderLeft: active ? '2px solid #6366f1' : '2px solid transparent',
        transition: 'background 0.2s ease, color 0.2s ease, border-color 0.2s ease, font-weight 0.1s ease',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateX(0)' : 'translateX(-12px)',
        transitionDelay: `${delay}s`,
        transitionProperty: 'background, color, border-color, opacity, transform',
        transitionDuration: '0.2s, 0.2s, 0.2s, 0.4s, 0.4s',
        transitionTimingFunction: 'ease, ease, ease, ease, cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {/* Active indicator glow */}
      {active && (
        <div style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '2px',
          height: '60%',
          background: '#6366f1',
          borderRadius: '0 2px 2px 0',
          boxShadow: '0 0 8px rgba(99,102,241,0.8)',
        }} />
      )}

      {/* Ripple effects */}
      {ripples.map(rp => (
        <span key={rp.id} style={{
          position: 'absolute',
          left: rp.x,
          top: rp.y,
          width: '8px',
          height: '8px',
          marginLeft: '-4px',
          marginTop: '-4px',
          borderRadius: '50%',
          background: 'rgba(165,180,252,0.4)',
          animation: 'ripple 0.6s ease-out forwards',
          pointerEvents: 'none',
        }} />
      ))}

      <span style={{
        display: 'flex',
        transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'scale(1.15)' : 'scale(1)',
      }}>
        <item.icon />
      </span>
      {item.label}
    </div>
  )
}

function ConnectedBadge() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 10px',
      borderRadius: '8px',
      background: 'rgba(22,163,74,0.12)',
      color: '#4ade80',
      fontSize: '12px',
      border: '0.5px solid rgba(74,222,128,0.2)',
    }}>
      <div style={{
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        background: '#4ade80',
        flexShrink: 0,
        animation: 'status-blink 2s ease-in-out infinite',
        boxShadow: '0 0 6px rgba(74,222,128,0.6)',
      }} />
      Google connected
    </div>
  )
}

function ConnectButton() {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href="https://omni-copilot-backend.onrender.com/auth/google"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 10px',
        borderRadius: '8px',
        background: hovered
          ? 'rgba(99,102,241,0.25)'
          : 'rgba(99,102,241,0.12)',
        color: '#a5b4fc',
        fontSize: '12px',
        textDecoration: 'none',
        border: '0.5px solid rgba(99,102,241,0.25)',
        transition: 'background 0.2s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
      }}
    >
      <div style={{
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        background: '#f87171',
        flexShrink: 0,
        animation: 'status-blink 1.5s ease-in-out infinite',
      }} />
      Connect Google
    </a>
  )
}

/* ── Icons ── */
function ChatIcon() {
  return <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
  </svg>
}
function FolderIcon() {
  return <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
  </svg>
}
function MailIcon() {
  return <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
  </svg>
}
function CalendarIcon() {
  return <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
}
function NoteIcon() {
  return <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
  </svg>
}
function CodeIcon() {
  return <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
  </svg>
}
