import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import AiStatusBadge from '../ai/AiStatusBadge'
import ApiKeyDrawer from '../ai/ApiKeyDrawer'
import AiChatBot from '../ai/AiChatBot'
import { GeminiProvider } from '../../hooks/GeminiContext'

const PAGE_TITLES = {
  '/': '마이 커리어 대시보드',
  '/graph': 'Career Graph 탐색',
  '/skill-gap': '스킬 갭 분석',
  '/advisor': '어드바이저 매칭',
  '/data-requirements': '데이터 요구사항',
}

export default function Layout({ children }) {
  const location = useLocation()
  const pageTitle = PAGE_TITLES[location.pathname] || '커리어 내비게이터'

  return (
    <GeminiProvider>
      <div className="app-layout">
        <Sidebar />
        <div className="app-main">
          <header className="app-header">
            <div className="header-breadcrumb">
              <span>Career Navigator</span>
              <span style={{ margin: '0 6px', opacity: 0.3 }}>/</span>
              <span className="current">{pageTitle}</span>
            </div>
            <div className="header-actions">
              {/* AI 상태 배지 */}
              <AiStatusBadge />
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                AI v2.0
              </span>
            </div>
          </header>
          <main className="app-content animate-fade-in" key={location.pathname}>
            {children}
          </main>
        </div>

        {/* 전역 AI 컴포넌트 */}
        <ApiKeyDrawer />
        <AiChatBot />
      </div>
    </GeminiProvider>
  )
}
