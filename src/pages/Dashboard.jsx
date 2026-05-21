import { usePersona } from '../App'
import { useNavigate } from 'react-router-dom'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { JOB_NODES, getScenarioRecommendations } from '../data/careerData'

export default function Dashboard() {
  const { persona } = usePersona()
  const navigate = useNavigate()

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
            <div className="hero-stat-value">{persona.evaluationGrade}</div>
            <div className="hero-stat-label">최근 평가 등급</div>
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
      <div className="glass-card glow-cyan" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="card-header">
            <div>
              <h3 className="card-title">Career Graph 미리보기</h3>
              <div className="card-subtitle">내 시나리오별 가능한 다음 커리어 경로</div>
            </div>
          </div>
          
          {/* CSS-only Mini Graph Visualization */}
          <div style={{ 
            position: 'relative', 
            height: '240px', 
            margin: '20px 0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.01)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed rgba(255, 255, 255, 0.05)'
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
    </div>
  )
}
