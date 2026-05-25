import { useState, useRef, useEffect } from 'react'
import { usePersona } from '../../App'
import { useGeminiContext } from '../../hooks/GeminiContext'
import { JOB_NODES } from '../../data/careerData'

const CHAT_SYSTEM_PROMPT = (persona, currentJobName, targetJobName) => `
당신은 대기업 Career Navigator에 내장된 '상냥하고 매우 날카로운 지능형 AI 커리어 밀착 멘토' 챗봇입니다.
현재 대화 중인 사용자의 세부 프로필 맥락을 기반으로 질문에 1:1로 맞춤 대화하십시오.

[대화 중인 상대방 맥락 정보]:
- 이름: ${persona.name} (${persona.grade}급)
- 소속: ${persona.department}
- 직무 연차: ${persona.totalYears}년 차
- 최근 평가 등급: ${persona.evaluationGrade}등급
- 현재 직무: ${currentJobName}
- 목표 지향: ${persona.careerIntent || 't-shape'} 트랙

대답 요령:
1. 사용자의 현재 직무와 커리어 목표에 결부하여 팩트 중심의 진솔하고 전문성 높은 피드백을 2-3문장 내외로 간결히 돌려주십시오.
2. 말투는 신뢰감 넘치는 "~입니다/합니다" 체를 기본으로 사용하고, 다정함과 객관성을 동시에 보여주십시오.
3. 3줄 내외로 콤팩트하게 정리하십시오.
`.trim()

// 오프라인 시뮬레이션 응답
function getSimulatedResponse(userInput, personaName) {
  if (userInput.includes('안녕') || userInput.includes('반가')) {
    return `반갑습니다, **${personaName}** 님! 현재 오프라인 시뮬레이션 모드로 동작 중입니다. 상단의 노란색 배지를 클릭해 Gemini API Key를 등록하시면 실시간 AI와 심층 커리어 상담이 가능합니다! 😊`
  }
  if (userInput.includes('스킬') || userInput.includes('역량') || userInput.includes('부족')) {
    return `스킬 갭 분석은 '스킬 갭 분석' 탭에서 목표 직무별 상세 격차를 확인하실 수 있습니다. 실시간 AI 코칭을 받으시려면 API Key를 등록해 주세요!`
  }
  if (userInput.includes('경력') || userInput.includes('커리어') || userInput.includes('이직')) {
    return `커리어 경로 분석은 'Career Graph' 탭에서 시각적으로 확인하실 수 있습니다. Gemini AI가 활성화되면 개인 맞춤형 경력 전략을 1:1로 대화하며 설계해 드릴 수 있습니다.`
  }
  return `현재 **오프라인 시뮬레이션 모드**로 동작하고 있습니다. 진짜 Gemini 1.5 Flash와 실시간 대화를 나누시려면 상단의 노란색 배지를 클릭해 **API Key를 등록**해 주세요! 😉`
}

export default function AiChatBot() {
  const { persona } = usePersona()
  const { apiStatus, generateWithLoading, isLoading } = useGeminiContext()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const currentJob = JOB_NODES?.[persona.currentJobId]
  const currentJobName = currentJob?.name || persona.currentJobName || '현재 직무'
  const targetJobName = '커리어 목표 직무'

  // 초기 환영 메시지 설정
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'bot',
        text: `안녕하세요 **${persona.name}** 님! 저는 Career Navigator의 AI 커리어 코치입니다. 😊\n\n현재 **${persona.department}**의 **${persona.grade}급 (${persona.totalYears}년차)** 프로필을 학습하였습니다. ${apiStatus ? 'Gemini AI가 연동되어 있어 실시간 맞춤 상담이 가능합니다!' : 'API Key를 등록하시면 실시간 Gemini AI와 상담하실 수 있습니다.'}`,
      },
    ])
  }, [persona.name, persona.department, persona.grade, persona.totalYears, apiStatus])

  // 스크롤 하단 고정
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 채팅 열릴 때 입력창 포커스
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const appendMessage = (role, text) => {
    setMessages((prev) => [...prev, { id: Date.now(), role, text }])
  }

  const handleSend = async () => {
    const text = inputText.trim()
    if (!text || isSending) return

    setInputText('')
    appendMessage('user', text)
    setIsSending(true)

    try {
      if (!apiStatus) {
        // 시뮬레이션 모드
        await new Promise((r) => setTimeout(r, 800))
        appendMessage('bot', getSimulatedResponse(text, persona.name))
      } else {
        // 실시간 Gemini 호출
        const systemPrompt = CHAT_SYSTEM_PROMPT(persona, currentJobName, targetJobName)
        const reply = await generateWithLoading(systemPrompt, text)

        if (reply === 'LIMIT_EXCEEDED') {
          appendMessage(
            'bot',
            '🛡️ 세션 API 호출 한도(25회)에 도달했습니다. 과금 방지를 위해 페이지를 새로고침한 후 계속 이용해 주세요.'
          )
        } else if (reply) {
          appendMessage('bot', reply)
        } else {
          throw new Error('empty reply')
        }
      }
    } catch (err) {
      appendMessage('bot', '❌ 응답 도중 오류가 발생했습니다. API Key와 네트워크 상태를 확인해 주세요.')
    } finally {
      setIsSending(false)
    }
  }

  const renderText = (text) => {
    // **bold** 처리 + 줄바꿈 처리
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g)
      return (
        <span key={i}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j}>{part.slice(2, -2)}</strong>
            }
            return part
          })}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      )
    })
  }

  return (
    <>
      {/* FAB 버튼 */}
      <button
        id="chatbot-fab"
        className={`chatbot-fab ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="AI 커리어 코치 채팅 열기"
        title="AI 커리어 코치와 대화하기"
      >
        {isOpen ? '✕' : '💬'}
        {!isOpen && (
          <span className={`fab-dot ${apiStatus ? 'active' : ''}`} />
        )}
      </button>

      {/* 채팅 패널 */}
      <div className={`chatbot-panel ${isOpen ? 'open' : ''}`}>
        {/* 헤더 */}
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar">🤖</div>
            <div>
              <h4>커리어 AI 코치</h4>
              <span className={`chatbot-status-text ${apiStatus ? 'active' : ''}`}>
                {apiStatus ? '🟢 Gemini 1.5 Flash 연동 중' : '🟡 오프라인 시뮬레이션 모드'}
              </span>
            </div>
          </div>
          <button className="btn-icon" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        {/* 메시지 영역 */}
        <div className="chatbot-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble ${msg.role}`}>
              {renderText(msg.text)}
            </div>
          ))}

          {/* 로딩 인디케이터 */}
          {isSending && (
            <div className="chat-bubble bot">
              <div className="chat-loading-dots">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력창 */}
        <div className="chatbot-input-area">
          <input
            ref={inputRef}
            type="text"
            className="chatbot-input"
            placeholder="커리어 고민을 이야기해 보세요..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isSending}
          />
          <button
            className="btn-chat-send"
            onClick={handleSend}
            disabled={isSending || !inputText.trim()}
          >
            ➤
          </button>
        </div>
      </div>
    </>
  )
}
