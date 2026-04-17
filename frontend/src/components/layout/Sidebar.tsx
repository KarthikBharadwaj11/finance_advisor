import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BarChart2, MessageSquare, Sparkles, LogOut } from 'lucide-react'
import { useAppStore } from '../../store/app'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analysis', icon: BarChart2, label: 'Analysis' },
  { to: '/advisor', icon: MessageSquare, label: 'AI Advisor' },
]

export function Sidebar() {
  const { user, logout } = useAppStore()
  const navigate = useNavigate()

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: 220,
      background: '#08080f', borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column', zIndex: 40,
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 14px rgba(124,58,237,0.45)' }}>
            <Sparkles size={13} color="#fff" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#e8e8f0' }}>FinanceAdv</span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 5px', borderRadius: 4, border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.1)', color: '#a78bfa' }}>AI</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 9, cursor: 'pointer',
                background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
                color: isActive ? '#c4b5fd' : '#66667a',
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s',
              }}>
                <Icon size={15} color={isActive ? '#a78bfa' : '#66667a'} />
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      {user && (
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#ccccdc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.full_name}</div>
              <div style={{ fontSize: 11, color: '#44444f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            </div>
            <button onClick={() => { logout(); navigate('/') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#44444f', padding: 4, display: 'flex', flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = '#88889a')}
              onMouseLeave={e => (e.currentTarget.style.color = '#44444f')}>
              <LogOut size={13} />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
