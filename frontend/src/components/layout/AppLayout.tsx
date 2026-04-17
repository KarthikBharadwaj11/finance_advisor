import { Outlet, Navigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useAppStore } from '../../store/app'

export function AppLayout() {
  const user = useAppStore(s => s.user)
  if (!user) return <Navigate to="/" replace />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#06060c', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 220, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
    </div>
  )
}
