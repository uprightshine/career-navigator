import { useState, useEffect, useRef } from 'react'
import { usePersona } from '../App'
import { useNavigate } from 'react-router-dom'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { JOB_NODES, getScenarioRecommendations } from '../data/careerData'
import { diagnoseCareer } from '../data/careerDiagnosis'
import { useGeminiContext } from '../hooks/GeminiContext'

export default function Dashboard() {
  const { persona } = usePersona()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('summary')
  const { generateWithLoading, apiStatus } = useGeminiContext()

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
        { ...recommendations.safe, type: 'safe', label: '안전형', color: '#34d399' },
        { ...recommendations.challenge, type: 'challenge', label: '도전형', color: '#f59e0b' },
        { ...recommendations['T자형'] || recommendations.t_shape, type: 't-shape', label: 'T자형', color: '#a78bfa' }
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
          <p>
            {persona.department} • {persona.grade}으로서 {currentJob?.name || persona.currentJobName} 직무를 수행 중입니다.
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
              <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
              <Radar
                name={persona.name}
                dataKey="value"
                stroke="#06b6d4"
                fill="rgba(6, 182, 212, 0.3)"
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
          <p className="text-secondary" style={{ fontSize: 'var(--font-size-xs)', marginTop: '8px', color: '#94a3b8' }}>
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
              color: '#94a3b8',
              fontSize: '11.5px',
              fontStyle: 'italic'
            }}>
              <span style={{ animation: 'pulse 1.5s infinite' }}>🌐 AI 경력 노드 네트워크 분석 중...</span>
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
              {/* Center Node (Current) */}
              <div style={{
                position: 'absolute',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #06b6d4 0%, #0891b2 100%)',
                border: '3px solid #22d3ee',
                boxShadow: '0 0 15px rgba(6, 182, 212, 0.6)',
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
                <>
                  <div style={{
                    position: 'absolute',
                    width: '2px',
                    height: '70px',
                    background: 'dashed rgba(52, 211, 153, 0.4)',
                    borderLeft: '2px dashed #34d399',
                    transform: 'rotate(-45deg)',
                    transformOrigin: '0 0',
                    top: '120px',
                    left: '120px',
                    zIndex: 1
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '30px',
                    left: '25px',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(17, 24, 39, 0.9)',
                    border: '2px solid #34d399',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    textAlign: 'center',
                    padding: '4px',
                    boxShadow: '0 0 10px rgba(52, 211, 153, 0.2)'
                  }}>
                    <span style={{ fontSize: '8px', color: '#34d399', fontWeight: 'bold' }}>안전형</span>
                    <span style={{ fontSize: '10px', color: '#f1f5f9', fontWeight: '500', display: 'block', maxHeight: '28px', overflow: 'hidden' }}>
                      {miniTargets[0].name.replace(' 시니어', '').replace(' 전환', '')}
                    </span>
                  </div>
                </>
              )}

              {/* Target 2 (Challenge) - Top Right */}
              {miniTargets[1] && (
                <>
                  <div style={{
                    position: 'absolute',
                    width: '2px',
                    height: '70px',
                    borderLeft: '2px dashed #f59e0b',
                    transform: 'rotate(45deg)',
                    transformOrigin: '0 0',
                    top: '120px',
                    left: '120px',
                    zIndex: 1
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '30px',
                    right: '25px',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(17, 24, 39, 0.9)',
                    border: '2px solid #f59e0b',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    textAlign: 'center',
                    padding: '4px',
                    boxShadow: '0 0 10px rgba(245, 158, 11, 0.2)'
                  }}>
                    <span style={{ fontSize: '8px', color: '#f59e0b', fontWeight: 'bold' }}>도전형</span>
                    <span style={{ fontSize: '10px', color: '#f1f5f9', fontWeight: '500', display: 'block', maxHeight: '28px', overflow: 'hidden' }}>
                      {miniTargets[1].name.replace(' 시니어', '').replace(' 전환', '')}
                    </span>
                  </div>
                </>
              )}

              {/* Target 3 (T-Shape) - Bottom Center */}
              {miniTargets[2] && (
                <>
                  <div style={{
                    position: 'absolute',
                    width: '2px',
                    height: '60px',
                    borderLeft: '2px dashed #a78bfa',
                    top: '120px',
                    left: '172px',
                    zIndex: 1
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: '25px',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(17, 24, 39, 0.9)',
                    border: '2px solid #a78bfa',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    textAlign: 'center',
                    padding: '4px',
                    boxShadow: '0 0 10px rgba(167, 139, 250, 0.2)'
                  }}>
                    <span style={{ fontSize: '8px', color: '#a78bfa', fontWeight: 'bold' }}>T자형</span>
                    <span style={{ fontSize: '10px', color: '#f1f5f9', fontWeight: '500', display: 'block', maxHeight: '28px', overflow: 'hidden' }}>
                      {miniTargets[2].name.replace(' 시니어', '').replace(' 전환', '')}
                    </span>
                  </div>
                </>
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
          <div className="action-icon">🗺️</div>
          <div className="action-content">
            <h4>커리어 경로 탐색</h4>
            <p>다양한 인사 이동 시나리오별로 나의 가능성을 시각화된 맵으로 분석해 보세요.</p>
          </div>
        </div>

        <div className="action-card" onClick={() => navigate('/skill-gap')}>
          <div className="action-icon">📊</div>
          <div className="action-content">
            <h4>역량 갭 분석</h4>
            <p>선택한 목표 직무를 얻기 위해 부족한 스킬과 성장 방안을 정밀 비교합니다.</p>
          </div>
        </div>

        <div className="action-card" onClick={() => navigate('/advisor')}>
          <div className="action-icon">🤝</div>
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
              <span>🔮</span> AI 맞춤형 커리어 코칭 리포트
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              사용자님의 직무 특성, 조직 레벨, 연차 및 사내 직무 이동 확률 모델에 기초한 실시간 맞춤 분석 리포트입니다.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="badge badge-cyan" style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 'bold' }}>
              📍 {diagnosis.currentLevel} {diagnosis.currentTrack}
            </span>
            <span className="badge badge-purple" style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 'bold' }}>
              📊 {diagnosis.careerPhase}
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
              📄 리포트 저장
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
          background: 'rgba(255, 255, 255, 0.02)', 
          border: '1px solid rgba(255, 255, 255, 0.04)', 
          borderRadius: '12px' 
        }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
              📍 현재 위치
            </span>
            <strong style={{ fontSize: '15px', color: '#fff', display: 'block' }}>
              {diagnosis.currentLevel} {diagnosis.currentTrack}
            </strong>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              {persona.department} • {persona.currentJobName} ({persona.yearsInRole}년차)
            </span>
          </div>
          
          <div>
            <span style={{ fontSize: '11px', color: 'var(--accent-purple)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
              📊 커리어 단계
            </span>
            <strong style={{ fontSize: '15px', color: '#fff', display: 'block' }}>
              {diagnosis.careerPhase}
            </strong>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              {diagnosis.phaseDescription.split('입니다.')[0]}입니다.
            </span>
          </div>

          <div>
            <span style={{ fontSize: '11px', color: 'var(--accent-pink)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
              👥 유사 경로 이동 비율
            </span>
            <strong style={{ fontSize: '15px', color: 'var(--accent-pink)', display: 'block' }}>
              {diagnosis.similarPathRate}
            </strong>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              동일 단계 또는 인접 트랙에서의 실제 발령 및 이동 확률 기반
            </span>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '12px' }}>
          <button
            onClick={() => handleTabChange('summary')}
            className={`btn ${activeTab === 'summary' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              padding: '10px 18px',
              fontSize: '12px',
              fontWeight: 'bold',
              borderRadius: '8px',
              background: activeTab === 'summary' ? 'var(--accent-purple)' : 'transparent',
              border: activeTab === 'summary' ? 'none' : '1px solid rgba(255,255,255,0.08)',
              color: activeTab === 'summary' ? '#0a0e1a' : '#94a3b8',
              boxShadow: activeTab === 'summary' ? '0 0 12px rgba(167, 139, 250, 0.4)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            💬 AI 코치 제언 & 요약
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
              border: activeTab === 'scenarios' ? 'none' : '1px solid rgba(255,255,255,0.08)',
              color: activeTab === 'scenarios' ? '#0a0e1a' : '#94a3b8',
              boxShadow: activeTab === 'scenarios' ? '0 0 12px rgba(167, 139, 250, 0.4)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🎯 추천 경로 (3대 시나리오)
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
              border: activeTab === 'timeline' ? 'none' : '1px solid rgba(255,255,255,0.08)',
              color: activeTab === 'timeline' ? '#0a0e1a' : '#94a3b8',
              boxShadow: activeTab === 'timeline' ? '0 0 12px rgba(167, 139, 250, 0.4)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🚀 1:1 실행 가이드 (Top 1)
          </button>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="animate-fade-in-up" key={activeTab}>
          
          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '20px', borderRadius: '12px' }}>
                  <h4 style={{ color: 'var(--accent-cyan)', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📍</span> 현재 직무 및 조직 체계 진단
                  </h4>
                  <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                    {diagnosis.positionDiagnosis || `사용자님의 현재 직무명은 "${persona.currentJobName}" 이며, 인사 분류 체계에 따라 [${diagnosis.currentTrack}] 트랙에 속합니다. 부서 및 비즈니스 유닛 분석에 따른 조직 내 위계 레벨은 ${diagnosis.currentLevel}로 판별되었습니다. 현 위치에서의 단단한 경험과 R&R 조율 능력은 다음 레벨로 확장하기 위한 훌륭한 레버리지입니다.`}
                  </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '20px', borderRadius: '12px' }}>
                  <h4 style={{ color: 'var(--accent-purple)', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📊</span> 커리어 단계 판단 상세
                  </h4>
                  <p style={{ fontSize: '15px', color: '#fff', fontWeight: '600', marginBottom: '8px' }}>
                    {diagnosis.careerPhase} 단계
                  </p>
                  <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                    {diagnosis.phaseDescription}
                  </p>
                </div>
              </div>

              {/* 우측 코칭 멘트 및 가이드 + 실시간 AI 버튼 */}
              <div style={{ background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)', border: '1px solid rgba(255,255,255,0.06)', padding: '24px', borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                    <span>💬</span> AI 커리어 코치의 제언
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
                      <>{apiStatus ? '✨ 실시간 AI 리포트 생성' : '✨ AI 리포트 생성'}</>
                    )}
                  </button>
                </div>

                {/* AI 리포트 표시 영역 */}
                {aiReport ? (
                  <div className="ai-report-result">
                    {aiReport.split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < aiReport.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.7', fontStyle: 'italic', margin: 0 }}>
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
                <span style={{ animation: 'pulse 1s infinite', fontSize: '12px', fontWeight: 'bold' }}>🎯 AI 시나리오 성공률 매핑 분석 중...</span>
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
                      border: rec.type === 'optimal' ? '1.5px solid rgba(167, 139, 250, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                      background: rec.type === 'optimal' ? 'rgba(167, 139, 250, 0.03)' : 'rgba(255,255,255,0.01)',
                      boxShadow: rec.type === 'optimal' ? '0 4px 20px rgba(167, 139, 250, 0.08)' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '16px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <span className={`badge ${rec.type === 'optimal' ? 'badge-purple' : rec.type === 'safe' ? 'badge-cyan' : 'badge-ghost'}`} style={{ fontSize: '10px', padding: '4px 8px' }}>
                          {rec.type === 'optimal' ? '최적 성장 경로 ⭐' : rec.type === 'safe' ? '안정 경로' : '대안 경로'}
                        </span>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>성공 확률</span>
                          <strong style={{ fontSize: '14px', color: rec.type === 'optimal' ? 'var(--accent-purple)' : 'var(--accent-cyan)' }}>
                            {rec.probability}
                          </strong>
                        </div>
                      </div>

                      <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
                        {rec.title}
                      </h4>
                      <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '14px' }}>
                        {rec.description}
                      </p>

                      {/* 확률 프로그레스 바 */}
                      <div style={{ background: 'rgba(255,255,255,0.05)', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '16px' }}>
                        <div 
                          style={{ 
                            width: rec.successRate, 
                            height: '100%', 
                            background: rec.type === 'optimal' ? 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))' : 'var(--accent-cyan)',
                            borderRadius: '3px'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '8px', fontSize: '11px', color: '#94a3b8', lineHeight: '1.5', borderLeft: `3px solid ${rec.type === 'optimal' ? 'var(--accent-purple)' : 'var(--accent-cyan)'}` }}>
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
              <div style={{ textAlign: 'center', padding: '40px', color: '#a78bfa', fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '150px', width: '100%' }}>
                <span style={{ animation: 'pulse 1s infinite', fontSize: '12px', fontWeight: 'bold' }}>⏰ 180일 AI 밀착 액션 가이드라인 생성 중...</span>
              </div>
            ) : (
              <div style={{ animation: 'fadeIn 0.5s ease', width: '100%' }}>
                <div style={{ background: 'rgba(167, 139, 250, 0.05)', border: '1px solid rgba(167, 139, 250, 0.15)', padding: '16px 20px', borderRadius: '10px', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🎯</span> 실행 로드맵 대상: <strong style={{ color: 'var(--accent-purple)' }}>{diagnosis.actionPlan.optimalTitle}</strong>
                  </h4>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                    성공 확률이 가장 높고 강력한 성장을 돕는 1순위 최적 경로로의 안착을 위한 단계별 180일 실행 가이드입니다.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  
                  {/* 30일 카드 */}
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', top: '-10px', left: '20px', 
                      background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', 
                      color: '#0a0e1a', fontWeight: '800', fontSize: '11px', padding: '4px 12px', borderRadius: '20px',
                      boxShadow: '0 0 10px rgba(6, 182, 212, 0.4)'
                    }}>
                      [30일]
                    </div>
                    <div style={{ marginTop: '6px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>현재 (Current)</span>
                      <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['30day'].current}</p>
                    </div>
                    <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--accent-purple)', fontWeight: 'bold', display: 'block' }}>목표 (Target)</span>
                      <p style={{ fontSize: '12px', color: '#fff', fontWeight: '600', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['30day'].target}</p>
                    </div>
                    <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                      <span style={{ fontSize: '10px', color: '#f87171', fontWeight: 'bold', display: 'block' }}>💡 Gap (역량 격차)</span>
                      <p style={{ fontSize: '12px', color: '#fca5a5', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['30day'].gap}</p>
                    </div>
                    <div style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px dashed rgba(6, 182, 212, 0.15)', padding: '12px', borderRadius: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 'bold', display: 'block' }}>🚀 실행 행동 (Action)</span>
                      <p style={{ fontSize: '11px', color: '#cbd5e1', margin: '2px 0 0 0', lineHeight: '1.5' }}>{diagnosis.actionPlan['30day'].action}</p>
                    </div>
                  </div>

                  {/* 90일 카드 */}
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', top: '-10px', left: '20px', 
                      background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)', 
                      color: '#0a0e1a', fontWeight: '800', fontSize: '11px', padding: '4px 12px', borderRadius: '20px',
                      boxShadow: '0 0 10px rgba(167, 139, 250, 0.4)'
                    }}>
                      [90일]
                    </div>
                    <div style={{ marginTop: '6px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>현재 (Current)</span>
                      <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['90day'].current}</p>
                    </div>
                    <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--accent-purple)', fontWeight: 'bold', display: 'block' }}>목표 (Target)</span>
                      <p style={{ fontSize: '12px', color: '#fff', fontWeight: '600', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['90day'].target}</p>
                    </div>
                    <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                      <span style={{ fontSize: '10px', color: '#f87171', fontWeight: 'bold', display: 'block' }}>💡 Gap (역량 격차)</span>
                      <p style={{ fontSize: '12px', color: '#fca5a5', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['90day'].gap}</p>
                    </div>
                    <div style={{ background: 'rgba(167, 139, 250, 0.05)', border: '1px dashed rgba(167, 139, 250, 0.15)', padding: '12px', borderRadius: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--accent-purple)', fontWeight: 'bold', display: 'block' }}>🚀 실행 행동 (Action)</span>
                      <p style={{ fontSize: '11px', color: '#cbd5e1', margin: '2px 0 0 0', lineHeight: '1.5' }}>{diagnosis.actionPlan['90day'].action}</p>
                    </div>
                  </div>

                  {/* 6개월 카드 */}
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', top: '-10px', left: '20px', 
                      background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', 
                      color: '#fff', fontWeight: '800', fontSize: '11px', padding: '4px 12px', borderRadius: '20px',
                      boxShadow: '0 0 10px rgba(236, 72, 153, 0.4)'
                    }}>
                      [6개월]
                    </div>
                    <div style={{ marginTop: '6px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>현재 (Current)</span>
                      <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['6month'].current}</p>
                    </div>
                    <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--accent-purple)', fontWeight: 'bold', display: 'block' }}>목표 (Target)</span>
                      <p style={{ fontSize: '12px', color: '#fff', fontWeight: '600', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['6month'].target}</p>
                    </div>
                    <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                      <span style={{ fontSize: '10px', color: '#f87171', fontWeight: 'bold', display: 'block' }}>💡 Gap (역량 격차)</span>
                      <p style={{ fontSize: '12px', color: '#fca5a5', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['6month'].gap}</p>
                    </div>
                    <div style={{ background: 'rgba(236, 72, 153, 0.05)', border: '1px dashed rgba(236, 72, 153, 0.15)', padding: '12px', borderRadius: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--accent-pink)', fontWeight: 'bold', display: 'block' }}>🚀 실행 행동 (Action)</span>
                      <p style={{ fontSize: '11px', color: '#cbd5e1', margin: '2px 0 0 0', lineHeight: '1.5' }}>{diagnosis.actionPlan['6month'].action}</p>
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
