import { NavLink } from 'react-router-dom'
import { usePersona } from '../../App'

const NAV_ITEMS = [
  { path: '/', icon: '📊', label: '대시보드' },
  { path: '/graph', icon: '🔗', label: 'Career Graph' },
  { path: '/skill-gap', icon: '📈', label: '스킬 갭 분석' },
  { path: '/advisor', icon: '🤝', label: '어드바이저 매칭' },
  { path: '/data-requirements', icon: '💾', label: '데이터 요구사항' },
]

export default function Sidebar() {
  const { persona, switchPersona } = usePersona()

  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">
        <h2>Career Navigator</h2>
        <span>내 다음 한 칸을 찾아서</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-persona">
        <div className="persona-selector" onClick={switchPersona}>
          <div className="persona-info">
            <div className="persona-avatar">
              {persona.name.charAt(0)}
            </div>
            <div className="persona-details">
              <div className="persona-name">{persona.name}</div>
              <div className="persona-role">
                {persona.currentJobName} · {persona.totalYears}년차
              </div>
            </div>
          </div>
          <div className="persona-switch">
            🔄 페르소나 전환 (데모용)
          </div>
        </div>
      </div>
    </aside>
  )
}
