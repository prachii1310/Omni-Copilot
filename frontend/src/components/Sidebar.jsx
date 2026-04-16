export default function Sidebar({ connected }) {
  const navItems = [
    { label: 'Chat', icon: ChatIcon, active: true },
    { label: 'Drive', icon: FolderIcon },
    { label: 'Gmail', icon: MailIcon },
    { label: 'Calendar', icon: CalendarIcon },
    { label: 'Notion', icon: NoteIcon },
    { label: 'Code', icon: CodeIcon },
  ]

  return (
    <div style={{
      width: '220px',
      background: '#0f0f1a',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      gap: '4px',
      flexShrink: 0
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '8px 4px 16px',
        borderBottom: '0.5px solid #ffffff18',
        marginBottom: '8px'
      }}>
        <div style={{
          width: '28px', height: '28px', background: '#6366f1',
          borderRadius: '8px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '13px',
          color: '#fff', fontWeight: '700', flexShrink: 0
        }}>O</div>
        <span style={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}>
          Omni Copilot
        </span>
      </div>

      {/* Nav */}
      {navItems.map(item => (
        <div key={item.label} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '9px 10px', borderRadius: '8px', cursor: 'pointer',
          background: item.active ? '#6366f120' : 'transparent',
          color: item.active ? '#a5b4fc' : '#ffffff70',
          fontSize: '13px',
          transition: 'background 0.15s'
        }}
          onMouseEnter={e => { if (!item.active) e.currentTarget.style.background = '#ffffff12' }}
          onMouseLeave={e => { if (!item.active) e.currentTarget.style.background = 'transparent' }}
        >
          <item.icon />
          {item.label}
        </div>
      ))}

      {/* Google connect status */}
      <div style={{ marginTop: 'auto' }}>
        {connected ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 10px', borderRadius: '8px',
            background: '#16a34a18', color: '#4ade80', fontSize: '12px'
          }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%',
              background: '#4ade80', flexShrink: 0 }}/>
            Google connected
          </div>
        ) : (
          <a href="http://localhost:3001/auth/google" style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 10px', borderRadius: '8px',
            background: '#6366f130', color: '#a5b4fc',
            fontSize: '12px', textDecoration: 'none'
          }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%',
              background: '#f87171', flexShrink: 0 }}/>
            Connect Google
          </a>
        )}
      </div>
    </div>
  )
}

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