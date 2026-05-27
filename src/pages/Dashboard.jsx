import { useState, useEffect, useRef } from 'react'
import { usePersona } from '../App'
import { useNavigate } from 'react-router-dom'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { JOB_NODES, getScenarioRecommendations } from '../data/careerData'
import { diagnoseCareer } from '../data/careerDiagnosis'
import { useGeminiContext } from '../hooks/GeminiContext'
import { useAiConfig } from '../App'

export default function Dashboard() {
  const { persona } = usePersona()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('summary')
  const { generateWithLoading, apiStatus } = useGeminiContext()
  const { aiEnabled, dataMode } = useAiConfig()

  // AI Report state
  const [aiReport, setAiReport] = useState('')
  const [isAiGenerating, setIsAiGenerating] = useState(false)
  const [aiTypingIdx, setAiTypingIdx] = useState(0)
  const aiTypingRef = useRef(null)

  // Progressive Disclosure Lazy States
  const [isMiniGraphLoading, setIsMiniGraphLoading] = useState(true)
  const [isScenariosLoading, setIsScenariosLoading] = useState(false)
  const [isTimelineLoading, setIsTimelineLoading] = useState(false)
  const [renderedScenarios, setRenderedScenarios] = useState(false)
  const [renderedTimeline, setRenderedTimeline] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExportReport = () => {
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
      alert(`📄 [AI 커리어 코칭 리포트 내보내기 완료]\n\n회원님의 맞춤 커리어 패스 리포트가 성공적으로 PDF 및 이미지 양식으로 변환되어 저장되었습니다.\n\n파일명: Career_Coaching_Report_${persona.name}.pdf`)
    }, 1500)
  }

  // 400ms delay to offload initial main thread paint
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMiniGraphLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  // Lazy tabs rendering trigger
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    if (tabId === 'scenarios' && !renderedScenarios) {
      setIsScenariosLoading(true)
      const timer = setTimeout(() => {
        setIsScenariosLoading(false)
        setRenderedScenarios(true)
      }, 350)
      return () => clearTimeout(timer)
    } else if (tabId === 'timeline' && !renderedTimeline) {
      setIsTimelineLoading(true)
      const timer = setTimeout(() => {
        setIsTimelineLoading(false)
        setRenderedTimeline(true)
      }, 350)
      return () => clearTimeout(timer)
    }
  }

  // 커리어 AI 정밀 진단 획득
  const diagnosis = diagnoseCareer(persona)

  // Gemini AI 리포트 생성
  const handleGenerateAiReport = async () => {
    if (isAiGenerating) return

    // 🔒 실 데이터 모드에서 AI API 차단
    if (!aiEnabled) {
      setAiReport('[보안 모드] AI 외부 API 호출이 차단되어 있습니다.\n\n상단 배너의 "AI OFF" 버튼을 클릭하여 AI를 활성화한 후 다시 시도하세요.\n\n⚠️  실 데이터(HS본부)가 외부 서버로 전송될 수 있습니다. 필요한 경우에만 활성화하세요.')
      return
    }

    setIsAiGenerating(true)
    setAiReport('')

    const currentJob = JOB_NODES?.[persona.currentJobId]
    const currentJobName = currentJob?.name || persona.currentJobName
    const skillsStr = persona.skills.map((sk) => `${sk.name}: L${sk.level}`).join(', ')

    const systemInstruction = `
당신은 국내 대기업 HR 20년 실무진급 경력을 가진 '초정밀 AI 커리어 성과 코칭 리포터' 에이전트입니다.
사용자가 입력하는 커리어 조건을 읽어내어, 실제 인사 전보 심사 수준으로 정교하고 동기부여가 확실히 되는 1:1 리포트 레터를 한글 3-4문장으로 작성하십시오.
규칙:
1. 첫 줄은 사용자의 이름과 경력을 요약하고, 사내 코호트 수준의 현재 위치를 강하게 인정합니다.
2. 두 번째 줄은 현재 보유 스킬에 따른 핵심 '역량 격차(Skill Gap)'를 데이터 분석 느낌으로 냉정히 진단합니다.
3. 세 번째 줄은 이를 극복하고 180일 내에 전보를 성공시키기 위해 당장 수행해야 할 LMS 교육이나 멘토 네트워킹 방향을 명시합니다.
4. 전체 길이는 한글 350자 이내로 콤팩트하게 마침표로 끝내십시오.
    `.trim()

    const userPrompt = `
이름: ${persona.name}
소속: ${persona.department}
직급: ${persona.grade}
직무체류년수: ${persona.totalYears}년
최근평가: ${persona.evaluationGrade}등급
현재직무: ${currentJobName}
자가진단 스킬셋: ${skillsStr}
    `.trim()

    try {
      const result = await generateWithLoading(systemInstruction, userPrompt)
      if (result === 'LIMIT_EXCEEDED') {
        setAiReport('🛡️ 세션 API 호출 한도에 도달했습니다. 페이지를 새로고침 후 다시 시도해 주세요.')
      } else if (result) {
        setAiReport(result)
      } else {
        setAiReport('오프라인 모드입니다. 상단 배지를 클릭해 Gemini API Key를 등록하시면 실시간 AI 코칭 리포트를 받으실 수 있습니다.')
      }
    } catch (err) {
      setAiReport('❌ AI 리포트 생성 중 오류가 발생했습니다. API Key와 네트워크 상태를 확인해 주세요.')
    } finally {
      setIsAiGenerating(false)
    }
  }

  // 역량 레이더 차트 데이터 포맷팅
  const radarData = persona.skills.map(skill => ({
    subject: skill.name,
    value: skill.level,
    fullMark: 5
  }))

  // 현재 직무 노드 획득
  const currentJob = JOB_NODES[persona.currentJobId]

  // 시나리오 추천 직무 획득
  const recommendations = getScenarioRecommendations(persona.currentJobId)
  
  // 미니 커리어 그래프에 표시할 3개의 추천 타겟
  const miniTargets = recommendations 
    ? [
        { ...recommendations.safe, type: 'safe', label: '직무심화', color: '#34d399' },
        { ...recommendations.challenge, type: 'challenge', label: '조직확장', color: '#f59e0b' },
        { ...(recommendations['T자형'] || recommendations.tShape || recommendations.t_shape), type: 't-shape', label: '복합확장', color: '#a78bfa' }
      ]
    : []

  return (
    <div className="dashboard-grid animate-fade-in-up">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-info">
          <h1>
            반가워요, <span className="highlight">{persona.name}</span> 님
          </h1>
          <p style={{ wordBreak: 'keep-all' }}>
            {persona.department} • {persona.grade}으로서 {currentJob?.name || persona.currentJobName} 직무를 수행 중입니다.<br />
            '내 다음 한 칸'을 위한 맞춤형 커리어 내비게이션을 시작해 보세요.
          </p>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">{persona.yearsInRole}년</div>
            <div className="hero-stat-label">현재 직무 체류</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value" style={{ fontSize: persona.evaluationHistory ? '14px' : undefined }}>
              {persona.evaluationHistory 
                ? persona.evaluationHistory.map(e => e.grade).join(' / ') 
                : persona.evaluationGrade}
            </div>
            <div className="hero-stat-label">3개년 평가 등급</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">상위 {100 - persona.cohortPercentile}%</div>
            <div className="hero-stat-label">동료 내 백분위</div>
          </div>
        </div>
      </div>

      {/* Left Column: Skill Radar Card */}
      <div className="glass-card">
        <div className="card-header">
          <div>
            <h3 className="card-title">내 역량 레이더</h3>
            <div className="card-subtitle">5단계 역량 성숙도 기준 진단 결과</div>
          </div>
          <span className="badge badge-cyan">주특기: {persona.primarySkill}</span>
        </div>
        <div style={{ width: '100%', height: '240px', marginTop: '20px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="rgba(0, 0, 0, 0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
              <Radar
                name={persona.name}
                dataKey="value"
                stroke="#000000"
                fill="rgba(0, 0, 0, 0.15)"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Cohort Comparison */}
        <div className="cohort-comparison" style={{ marginTop: '24px' }}>
          <h4 className="card-title" style={{ fontSize: 'var(--font-size-sm)' }}>동료 대비 나의 위치</h4>
          <div className="cohort-bar-container">
            <div className="cohort-bar-track"></div>
            <div 
              className="cohort-bar-marker" 
              style={{ left: `${persona.cohortPercentile}%` }}
            ></div>
          </div>
          <div className="cohort-labels">
            <span>성장 요함</span>
            <span>평균</span>
            <span>최우수</span>
          </div>
          <p className="text-secondary" style={{ fontSize: 'var(--font-size-xs)', marginTop: '8px', color: 'var(--text-secondary)' }}>
            비슷한 경력 {persona.totalYears}년차 동료 대비 상위 {100 - persona.cohortPercentile}%에 위치해 있으며, 핵심 역량들이 균형 있게 발달해 있습니다.
          </p>
        </div>
      </div>

      {/* Center Column: Career Graph Mini Preview */}
      <div className="glass-card glow-cyan" style={{ display: 'flex', flexDirection: 'column', justifycontent: 'space-between' }}>
        <div>
          <div className="card-header">
            <div>
              <h3 className="card-title">Career Graph 미리보기</h3>
              <div className="card-subtitle">내 시나리오별 가능한 다음 커리어 경로</div>
            </div>
          </div>
          
          {/* CSS-only Mini Graph Visualization with Progressive Disclosure */}
          {isMiniGraphLoading ? (
            <div style={{ 
              height: '240px', 
              margin: '20px 0', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.01)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed rgba(255, 255, 255, 0.05)',
              color: 'var(--text-secondary)',
              fontSize: '11.5px',
              fontStyle: 'italic'
            }}>
              <span style={{ animation: 'pulse 1.5s infinite', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.6 }}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                AI 경력 노드 네트워크 분석 중...
              </span>
            </div>
          ) : (
            <div style={{ 
              position: 'relative', 
              height: '240px', 
              margin: '20px 0', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.01)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed rgba(255, 255, 255, 0.05)',
              animation: 'fadeIn 0.5s ease'
            }}>
              {/* Responsive SVG Connecting Paths */}
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                {miniTargets[0] && (
                  <line 
                    x1="50%" y1="50%" 
                    x2="57px" y2="62px" 
                    stroke="var(--scenario-safe)" 
                    strokeWidth="2" 
                    strokeDasharray="4 4" 
                  />
                )}
                {miniTargets[1] && (
                  <line 
                    x1="50%" y1="50%" 
                    x2="calc(100% - 57px)" y2="62px" 
                    stroke="var(--scenario-challenge)" 
                    strokeWidth="2" 
                    strokeDasharray="4 4" 
                  />
                )}
                {miniTargets[2] && (
                  <line 
                    x1="50%" y1="50%" 
                    x2="50%" y2="183px" 
                    stroke="var(--scenario-t-shape)" 
                    strokeWidth="2" 
                    strokeDasharray="4 4" 
                  />
                )}
              </svg>

              {/* Center Node (Current) */}
              <div style={{
                position: 'absolute',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #000000 0%, #1f2937 100%)',
                border: '3px solid #ffffff',
                boxShadow: '0 0 15px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 3,
                textAlign: 'center',
                padding: '5px'
              }}>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', fontWeight: 'bold' }}>현재</span>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '70px' }}>
                  {currentJob?.name || persona.currentJobName}
                </span>
              </div>

              {/* Target 1 (Safe) - Top Left */}
              {miniTargets[0] && (
                <div style={{
                  position: 'absolute',
                  top: '30px',
                  left: '25px',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(17, 24, 39, 0.95)',
                  border: '2px solid var(--scenario-safe)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  textAlign: 'center',
                  padding: '4px',
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.08)'
                }}>
                  <span style={{ fontSize: '8px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 'bold' }}>직무심화</span>
                  <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', display: 'block' }}>{miniTargets[0].orgLevelLabel || '사업부'}</span>
                  <span style={{ fontSize: '10px', color: '#ffffff', fontWeight: '500', display: 'block', maxHeight: '28px', overflow: 'hidden' }}>
                    {miniTargets[0].name.replace(' 시니어', '').replace(' 전환', '')}
                  </span>
                </div>
              )}

              {/* Target 2 (Challenge) - Top Right */}
              {miniTargets[1] && (
                <div style={{
                  position: 'absolute',
                  top: '30px',
                  right: '25px',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(17, 24, 39, 0.95)',
                  border: '2px solid var(--scenario-challenge)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  textAlign: 'center',
                  padding: '4px',
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.08)'
                }}>
                  <span style={{ fontSize: '8px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 'bold' }}>조직확장</span>
                  <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', display: 'block' }}>{miniTargets[1].orgLevelLabel || '본부'}</span>
                  <span style={{ fontSize: '10px', color: '#ffffff', fontWeight: '500', display: 'block', maxHeight: '28px', overflow: 'hidden' }}>
                    {miniTargets[1].name.replace(' 시니어', '').replace(' 전환', '')}
                  </span>
                </div>
              )}

              {/* Target 3 (T-Shape) - Bottom Center */}
              {miniTargets[2] && (
                <div style={{
                  position: 'absolute',
                  bottom: '25px',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(17, 24, 39, 0.95)',
                  border: '2px solid var(--scenario-t-shape)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  textAlign: 'center',
                  padding: '4px',
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.08)'
                }}>
                  <span style={{ fontSize: '8px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 'bold' }}>복합확장</span>
                  <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', display: 'block' }}>{miniTargets[2].orgLevelLabel || '본부'}</span>
                  <span style={{ fontSize: '10px', color: '#ffffff', fontWeight: '500', display: 'block', maxHeight: '28px', overflow: 'hidden' }}>
                    {miniTargets[2].name.replace(' 시니어', '').replace(' 전환', '')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/graph')}
          style={{ width: '100%' }}
        >
          Career Graph 전체 보기 →
        </button>
      </div>

      {/* Right Column: Recommended Actions */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h3 className="card-title">다음 추천 액션</h3>
          <div className="card-subtitle">목표 달성을 위한 개인화된 할 일</div>
        </div>
        
        <div className="action-card" onClick={() => navigate('/graph')}>
          <div className="action-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: '#000000' }}>
              <path d="M9 20l-5-3V4l5 3M15 4l5 3v13l-5-3M9 7v13M15 4v13M9 7l6-3M9 20l6-3" />
            </svg>
          </div>
          <div className="action-content">
            <h4>커리어 경로 탐색</h4>
            <p>다양한 인사 이동 시나리오별로 나의 가능성을 시각화된 맵으로 분석해 보세요.</p>
          </div>
        </div>

        <div className="action-card" onClick={() => navigate('/skill-gap')}>
          <div className="action-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: '#000000' }}>
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <div className="action-content">
            <h4>역량 갭 분석</h4>
            <p>선택한 목표 직무를 얻기 위해 부족한 스킬과 성장 방안을 정밀 비교합니다.</p>
          </div>
        </div>

        <div className="action-card" onClick={() => navigate('/advisor')}>
          <div className="action-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: '#000000' }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="action-content">
            <h4>어드바이저 매칭</h4>
            <p>이 경로를 앞서서 성공적으로 통과한 사내외 멘토를 추천받고 매칭을 신청해 보세요.</p>
          </div>
        </div>
      </div>

      {/* AI 맞춤형 커리어 코칭 리포트 */}
      <div 
        className="glass-card glow-purple animate-fade-in-up" 
        style={{ 
          gridColumn: '1 / -1', 
          marginTop: '24px', 
          padding: '30px', 
          border: '1px solid rgba(124, 92, 246, 0.15)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(245, 243, 255, 0.85) 100%)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-medium)', paddingBottom: '20px', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#7c3aed' }}>
                <path d="M12 3v4M12 17v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
              </svg>
              AI 맞춤형 커리어 코칭 리포트
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              사용자님의 직무 특성, 조직 레벨, 연차 및 사내 직무 이동 확률 모델에 기초한 실시간 맞춤 분석 리포트입니다.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="badge badge-cyan" style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/></svg>
              {diagnosis.currentLevel} {diagnosis.currentTrack}
            </span>
            <span className="badge badge-purple" style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              {diagnosis.careerPhase}
            </span>
            <button
              onClick={handleExportReport}
              style={{
                background: 'linear-gradient(135deg, var(--accent-purple) 0%, #7c3aed 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all var(--transition-fast) ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              title="리포트를 PDF 파일로 저장"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              리포트 저장
            </button>
          </div>
        </div>

        {/* 요약 블록 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px', 
          marginBottom: '24px', 
          padding: '20px', 
          background: 'var(--bg-glass)', 
          border: '1px solid var(--border-medium)', 
          borderRadius: '12px' 
        }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/></svg>
              현재 위치
            </span>
            <strong style={{ fontSize: '15px', color: 'var(--text-primary)', display: 'block' }}>
              {diagnosis.currentLevel} {diagnosis.currentTrack}
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {persona.department} • {persona.currentJobName} ({persona.yearsInRole}년차)
            </span>
          </div>
          
          <div>
            <span style={{ fontSize: '11px', color: 'var(--accent-purple)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              커리어 단계
            </span>
            <strong style={{ fontSize: '15px', color: 'var(--text-primary)', display: 'block' }}>
              {diagnosis.careerPhase}
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {diagnosis.phaseDescription.split('입니다.')[0]}입니다.
            </span>
          </div>

          <div>
            <span style={{ fontSize: '11px', color: 'var(--accent-pink)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              유사 경로 이동 비율
            </span>
            <strong style={{ fontSize: '15px', color: 'var(--text-primary)', display: 'block' }}>
              {diagnosis.similarPathRate}
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              동일 단계 또는 인접 트랙에서의 실제 발령 및 이동 확률 기반
            </span>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-medium)', paddingBottom: '12px' }}>
          <button
            onClick={() => handleTabChange('summary')}
            className={`btn ${activeTab === 'summary' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              padding: '10px 18px',
              fontSize: '12px',
              fontWeight: 'bold',
              borderRadius: '8px',
              background: activeTab === 'summary' ? 'var(--accent-purple)' : 'transparent',
              border: activeTab === 'summary' ? 'none' : '1px solid var(--border-medium)',
              color: activeTab === 'summary' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: activeTab === 'summary' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            AI 코치 제언 & 요약
          </button>
          <button
            onClick={() => handleTabChange('scenarios')}
            className={`btn ${activeTab === 'scenarios' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              padding: '10px 18px',
              fontSize: '12px',
              fontWeight: 'bold',
              borderRadius: '8px',
              background: activeTab === 'scenarios' ? 'var(--accent-purple)' : 'transparent',
              border: activeTab === 'scenarios' ? 'none' : '1px solid var(--border-medium)',
              color: activeTab === 'scenarios' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: activeTab === 'scenarios' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            추천 경로 (3대 시나리오)
          </button>
          <button
            onClick={() => handleTabChange('timeline')}
            className={`btn ${activeTab === 'timeline' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              padding: '10px 18px',
              fontSize: '12px',
              fontWeight: 'bold',
              borderRadius: '8px',
              background: activeTab === 'timeline' ? 'var(--accent-purple)' : 'transparent',
              border: activeTab === 'timeline' ? 'none' : '1px solid var(--border-medium)',
              color: activeTab === 'timeline' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: activeTab === 'timeline' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            1:1 실행 가이드 (Top 1)
          </button>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="animate-fade-in-up" key={activeTab}>
          
          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-medium)', padding: '20px', borderRadius: '12px' }}>
                  <h4 style={{ color: 'var(--accent-cyan)', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/></svg>
                    현재 직무 및 조직 체계 진단
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    {diagnosis.positionDiagnosis || `사용자님의 현재 직무명은 "${persona.currentJobName}" 이며, 인사 분류 체계에 따라 [${diagnosis.currentTrack}] 트랙에 속합니다. 부서 및 비즈니스 유닛 분석에 따른 조직 내 위계 레벨은 ${diagnosis.currentLevel}로 판별되었습니다. 현 위치에서의 단단한 경험과 R&R 조율 능력은 다음 레벨로 확장하기 위한 훌륭한 레버리지입니다.`}
                  </p>
                </div>

                <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-medium)', padding: '20px', borderRadius: '12px' }}>
                  <h4 style={{ color: 'var(--accent-purple)', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    커리어 단계 판단 상세
                  </h4>
                  <p style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: '600', marginBottom: '8px' }}>
                    {diagnosis.careerPhase} 단계
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    {diagnosis.phaseDescription}
                  </p>
                </div>
              </div>

              {/* 우측 코칭 멘트 및 가이드 + 실시간 AI 버튼 */}
              <div style={{ background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.01) 0%, rgba(0, 0, 0, 0.04) 100%)', border: '1px solid var(--border-medium)', padding: '24px', borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    AI 커리어 코치의 제언
                  </h4>
                  {/* ✨ Gemini AI 리포트 생성 버튼 */}
                  <button
                    id="btn-ai-report"
                    className={`btn-ai-report ${isAiGenerating ? 'loading' : ''}`}
                    onClick={handleGenerateAiReport}
                    disabled={isAiGenerating}
                    title={apiStatus ? '실시간 Gemini AI 리포트 생성' : 'API Key를 등록하면 실시간 AI 분석을 받을 수 있습니다'}
                  >
                    {isAiGenerating ? (
                      <><span className="ai-btn-dot" /><span className="ai-btn-dot" /><span className="ai-btn-dot" /></>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}><path d="M12 3v4M12 17v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/></svg>
                        {apiStatus ? '실시간 AI 리포트 생성' : 'AI 리포트 생성'}
                      </>
                    )}
                  </button>
                </div>

                {/* AI 리포트 표시 영역 */}
                {aiReport ? (
                  <div className="ai-report-result" style={{ color: 'var(--text-secondary)' }}>
                    {aiReport.split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < aiReport.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7', fontStyle: 'italic', margin: 0 }}>
                    {diagnosis.coachAdvice ? (
                      diagnosis.coachAdvice.split('\n\n').map((paragraph, pIdx) => (
                        <span key={pIdx} style={{ display: 'block', marginBottom: pIdx < 2 ? '14px' : '0' }}>
                           {paragraph}
                        </span>
                      ))
                    ) : (
                      `${persona.name} 님의 커리어 데이터를 기반으로 한 AI 진단 코멘트가 이곳에 표시됩니다. 우측 상단 버튼을 눌러 실시간 Gemini AI 리포트를 생성해 보세요.`
                    )}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SCENARIOS (🎯 추천 경로) */}
          {activeTab === 'scenarios' && (
            isScenariosLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#06b6d4', fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '150px', width: '100%' }}>
                <span style={{ animation: 'pulse 1s infinite', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                  AI 시나리오 성공률 매핑 분석 중...
                </span>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', animation: 'fadeIn 0.5s ease', width: '100%' }}>
                {diagnosis.recommendations.map((rec, idx) => (
                  <div 
                    key={idx} 
                    className="glass-card" 
                    style={{ 
                      margin: 0, 
                      padding: '24px', 
                      border: rec.type === 'optimal' ? '2.0px solid #000000' : '1px solid var(--border-medium)',
                      background: rec.type === 'optimal' ? 'rgba(0, 0, 0, 0.02)' : 'var(--bg-glass)',
                      boxShadow: rec.type === 'optimal' ? 'var(--shadow-md)' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '16px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <span className={`badge ${rec.type === 'optimal' ? 'badge-purple' : rec.type === 'safe' ? 'badge-cyan' : 'badge-ghost'}`} style={{ fontSize: '10px', padding: '4px 8px' }}>
                          {rec.type === 'optimal' ? '최적 성장 경로 ★' : rec.type === 'safe' ? '안정 경로' : '대안 경로'}
                        </span>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>성공 확률</span>
                          <strong style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                            {rec.probability}
                          </strong>
                        </div>
                      </div>

                      <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {rec.title}
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '14px' }}>
                        {rec.description}
                      </p>

                      {/* 확률 프로그레스 바 */}
                      <div style={{ background: 'var(--border-medium)', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '16px' }}>
                        <div 
                          style={{ 
                            width: rec.successRate, 
                            height: '100%', 
                            background: 'var(--accent-cyan)',
                            borderRadius: '3px'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.04)', padding: '12px', borderRadius: '8px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5', borderLeft: `3px solid ${rec.type === 'optimal' ? '#000000' : 'var(--text-tertiary)'}` }}>
                      <strong>현재 상태와의 연결 이유:</strong><br/>
                      {rec.reason}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 3: TIMELINE (🚀 실행 가이드) */}
          {activeTab === 'timeline' && diagnosis.actionPlan && (
            isTimelineLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--accent-cyan)', fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '150px', width: '100%' }}>
                <span style={{ animation: 'pulse 1s infinite', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  180일 AI 밀착 액션 가이드라인 생성 중...
                </span>
              </div>
            ) : (
              <div style={{ animation: 'fadeIn 0.5s ease', width: '100%' }}>
                <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-medium)', padding: '16px 20px', borderRadius: '10px', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                    실행 로드맵 대상: <strong style={{ color: '#000000' }}>{diagnosis.actionPlan.optimalTitle}</strong>
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    성공 확률이 가장 높고 강력한 성장을 돕는 1순위 최적 경로로의 안착을 위한 단계별 180일 실행 가이드입니다.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  
                  {/* 30일 카드 */}
                  <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', top: '-10px', left: '20px', 
                      background: 'linear-gradient(135deg, #000000 0%, #1f2937 100%)', 
                      color: '#ffffff', fontWeight: '800', fontSize: '11px', padding: '4px 12px', borderRadius: '20px',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)'
                    }}>
                      [30일]
                    </div>
                    <div style={{ marginTop: '6px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>현재 (Current)</span>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['30day'].current}</p>
                    </div>
                    <div style={{ borderTop: '1px dashed var(--border-medium)', paddingTop: '10px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--accent-purple)', fontWeight: 'bold', display: 'block' }}>목표 (Target)</span>
                      <p style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '600', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['30day'].target}</p>
                    </div>
                    <div style={{ borderTop: '1px dashed var(--border-medium)', paddingTop: '10px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        Gap (역량 격차)
                      </span>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['30day'].gap}</p>
                    </div>
                    <div style={{ background: 'rgba(0, 0, 0, 0.03)', border: '1px dashed var(--border-medium)', padding: '12px', borderRadius: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        실행 행동 (Action)
                      </span>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0 0', lineHeight: '1.5' }}>{diagnosis.actionPlan['30day'].action}</p>
                    </div>
                  </div>

                  {/* 90일 카드 */}
                  <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', top: '-10px', left: '20px', 
                      background: 'linear-gradient(135deg, #1f2937 0%, #4b5563 100%)', 
                      color: '#ffffff', fontWeight: '800', fontSize: '11px', padding: '4px 12px', borderRadius: '20px',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.12)'
                    }}>
                      [90일]
                    </div>
                    <div style={{ marginTop: '6px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>현재 (Current)</span>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['90day'].current}</p>
                    </div>
                    <div style={{ borderTop: '1px dashed var(--border-medium)', paddingTop: '10px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--accent-purple)', fontWeight: 'bold', display: 'block' }}>목표 (Target)</span>
                      <p style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '600', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['90day'].target}</p>
                    </div>
                    <div style={{ borderTop: '1px dashed var(--border-medium)', paddingTop: '10px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        Gap (역량 격차)
                      </span>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['90day'].gap}</p>
                    </div>
                    <div style={{ background: 'rgba(0, 0, 0, 0.03)', border: '1px dashed var(--border-medium)', padding: '12px', borderRadius: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--accent-purple)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        실행 행동 (Action)
                      </span>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0 0', lineHeight: '1.5' }}>{diagnosis.actionPlan['90day'].action}</p>
                    </div>
                  </div>

                  {/* 6개월 카드 */}
                  <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', top: '-10px', left: '20px', 
                      background: 'linear-gradient(135deg, #4b5563 0%, #9ca3af 100%)', 
                      color: '#ffffff', fontWeight: '800', fontSize: '11px', padding: '4px 12px', borderRadius: '20px',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                    }}>
                      [6개월]
                    </div>
                    <div style={{ marginTop: '6px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>현재 (Current)</span>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['6month'].current}</p>
                    </div>
                    <div style={{ borderTop: '1px dashed var(--border-medium)', paddingTop: '10px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--accent-purple)', fontWeight: 'bold', display: 'block' }}>목표 (Target)</span>
                      <p style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '600', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['6month'].target}</p>
                    </div>
                    <div style={{ borderTop: '1px dashed var(--border-medium)', paddingTop: '10px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        Gap (역량 격차)
                      </span>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['6month'].gap}</p>
                    </div>
                    <div style={{ background: 'rgba(0, 0, 0, 0.03)', border: '1px dashed var(--border-medium)', padding: '12px', borderRadius: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--accent-pink)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        실행 행동 (Action)
                      </span>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0 0', lineHeight: '1.5' }}>{diagnosis.actionPlan['6month'].action}</p>
                    </div>
                  </div>

                </div>
              </div>
            )
          )}

        </div>
      </div>

      {/* 리포트 내보내기 시뮬레이션 로딩 오버레이 팝업 */}
      {isExporting && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div className="glass-card glow-purple" style={{
            padding: '40px',
            textAlign: 'center',
            maxWidth: '400px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div className="premium-spinner" style={{ margin: '0 auto 20px auto' }}>
              <div className="premium-spinner-outer" />
              <div className="premium-spinner-inner" />
              <div className="premium-spinner-core" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
              리포트 고해상도 변환 중...
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              개인화 성장 궤도 및 실행 타임라인을 고화질 PDF 템플릿으로 출력하는 중입니다. 잠시만 기다려주세요.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
