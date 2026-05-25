import { useGeminiContext } from '../../hooks/GeminiContext'

/**
 * 헤더에 표시되는 AI API 상태 배지
 * - 🟡 오프라인 시뮬레이션 모드
 * - 🟢 AI 실시간 연동 활성화
 * - 클릭 시 ApiKeyDrawer 오픈
 */
export default function AiStatusBadge() {
  const { apiStatus, openDrawer } = useGeminiContext()

  return (
    <button
      id="ai-status-badge"
      className={`ai-status-badge ${apiStatus ? 'active' : ''}`}
      onClick={openDrawer}
      title={apiStatus ? 'Gemini AI 연동 활성화 상태 (클릭하여 설정)' : 'API 키를 설정해 AI를 활성화하세요'}
    >
      <span className="badge-dot">{apiStatus ? '🟢' : '🟡'}</span>
      <span className="badge-text">
        {apiStatus ? 'AI 실시간 연동 활성화' : '오프라인 시뮬레이션 모드'}
      </span>
    </button>
  )
}
