import { useState } from 'react'
import { useGeminiContext } from '../../hooks/GeminiContext'

/**
 * Gemini API 키 설정 슬라이드 드로어
 * - 우측에서 슬라이드 인
 * - API 키 입력/저장/삭제
 * - 과금 방지 안내
 */
export default function ApiKeyDrawer() {
  const { apiStatus, isDrawerOpen, closeDrawer, saveApiKey, clearApiKey, callCount, maxCalls } =
    useGeminiContext()
  const [inputVal, setInputVal] = useState('')
  const [saveMsg, setSaveMsg] = useState('')

  const handleSave = () => {
    if (!inputVal.trim()) {
      setSaveMsg('⚠️ 올바른 API Key를 입력해 주세요.')
      return
    }
    saveApiKey(inputVal)
    setInputVal('')
    setSaveMsg('🟢 API Key가 저장되었습니다! 이제 실시간 AI 진단 및 챗봇을 사용할 수 있습니다.')
    setTimeout(() => {
      setSaveMsg('')
      closeDrawer()
    }, 2000)
  }

  const handleClear = () => {
    clearApiKey()
    setInputVal('')
    setSaveMsg('🗑️ 저장된 API Key가 제거되었습니다. 오프라인 시뮬레이션 모드로 전환됩니다.')
    setTimeout(() => {
      setSaveMsg('')
      closeDrawer()
    }, 2000)
  }

  return (
    <>
      {/* Overlay */}
      {isDrawerOpen && (
        <div className="drawer-overlay" onClick={closeDrawer} />
      )}

      {/* Drawer Panel */}
      <div className={`api-key-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3>⚙️ AI 연동 설정</h3>
          <button className="btn-icon" onClick={closeDrawer} aria-label="닫기">✕</button>
        </div>

        <div className="drawer-body">
          {/* Current Status */}
          <div className={`drawer-status-card ${apiStatus ? 'active' : ''}`}>
            <span>{apiStatus ? '🟢 AI 실시간 연동 활성화' : '🟡 오프라인 시뮬레이션 모드'}</span>
            {apiStatus && (
              <span className="session-count">
                이번 세션 {callCount}/{maxCalls}회 사용
              </span>
            )}
          </div>

          {/* Description */}
          <p className="drawer-desc">
            본 서비스는 <strong>Google Gemini 1.5 Flash API</strong>를 통해 100% 실시간
            커리어 코칭과 자연어 상담을 제공합니다.
            <br />
            <br />
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="drawer-link"
            >
              → Google AI Studio에서 무료 API Key 발급 받기
            </a>
          </p>

          {/* Input */}
          <div className="form-group">
            <label htmlFor="api-key-input">Gemini API Key 입력</label>
            <input
              id="api-key-input"
              type="password"
              className="form-control"
              placeholder="AIzaSy...로 시작하는 Key 입력"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>

          {/* Actions */}
          <div className="drawer-actions">
            <button className="btn btn-primary" onClick={handleSave}>
              💾 API Key 저장 및 연동하기
            </button>
            {apiStatus && (
              <button
                className="btn btn-ghost"
                onClick={handleClear}
                style={{ color: 'var(--accent-rose)' }}
              >
                🗑️ 연동 키 삭제 (오프라인 복귀)
              </button>
            )}
          </div>

          {/* Save Message */}
          {saveMsg && (
            <div className="drawer-save-msg">{saveMsg}</div>
          )}

          {/* Footer Notice */}
          <div className="drawer-notice">
            💡 분당 최대 15회 호출까지는 <strong>100% 완전 무료(0원)</strong> 티어입니다.
            <br />
            API Key는 서버로 전송되지 않고 <strong>사용자의 로컬 브라우저에만</strong> 안전하게
            보관됩니다.
            <br />
            <br />
            🛡️ 과금 방지: 세션 당 최대 <strong>{maxCalls}회</strong> 호출로 제한됩니다.
          </div>
        </div>
      </div>
    </>
  )
}
