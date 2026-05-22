import { useState } from 'react'
import { usePersona } from '../App'
import { useNavigate } from 'react-router-dom'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { JOB_NODES, getScenarioRecommendations } from '../data/careerData'
import { diagnoseCareer } from '../data/careerDiagnosis'

export default function Dashboard() {
  const { persona } = usePersona()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('summary')

  // 커리어 AI 정밀 진단 획득
  const diagnosis = diagnoseCareer(persona)

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

      {/* AI 맞춤형 커리어 코칭 리포트 (Career Coaching Report) */}
      <div 
        className="glass-card glow-purple animate-fade-in-up" 
        style={{ 
          gridColumn: '1 / -1', 
          marginTop: '24px', 
          padding: '30px', 
          border: '1px solid rgba(167, 139, 250, 0.25)',
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(10, 14, 26, 0.95) 100%)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <span>🔮</span> AI 맞춤형 커리어 코칭 리포트
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>
              사용자님의 직무 특성, 연차 및 사내 직무 이동 확률 모델에 기초한 실시간 맞춤 분석 리포트입니다.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-cyan" style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 'bold' }}>
              📍 현재 위치: {diagnosis.currentTrack}
            </span>
            <span className="badge badge-purple" style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 'bold' }}>
              📊 단계: {diagnosis.careerPhase}
            </span>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('summary')}
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
            📍 진단 및 경력 요약
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
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
            🎯 3대 추천 시나리오
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
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
                    <span>📍</span> 현재 직무 분석
                  </h4>
                  <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                    사용자님의 현재 공식 직무명은 <strong style={{ color: '#fff' }}>"{persona.currentJobName}"</strong> 이며,
                    인적 데이터 분류 기준에 따라 <strong style={{ color: '#fff' }}>[{diagnosis.currentTrack}]</strong> 트랙에 정합합니다. 
                    현재 직무에서의 체류 기간 <strong style={{ color: 'var(--accent-cyan)' }}>{persona.yearsInRole}년</strong>(총 경력 {persona.totalYears}년) 동안 축적해오신 
                    핵심 강점 스킬들은 다음 한 칸의 커리어 성장을 구축하는 데 강력한 초석이 될 것입니다.
                  </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '20px', borderRadius: '12px' }}>
                  <h4 style={{ color: 'var(--accent-purple)', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📊</span> 커리어 성장 단계 진단
                  </h4>
                  <p style={{ fontSize: '15px', color: '#fff', fontWeight: '600', marginBottom: '8px' }}>
                    {diagnosis.careerPhase} 단계
                  </p>
                  <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                    {diagnosis.phaseDescription}
                  </p>
                </div>
              </div>

              {/* 우측 코칭 멘트 및 가이드 */}
              <div style={{ background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)', border: '1px solid rgba(255,255,255,0.06)', padding: '24px', borderRadius: '12px', height: '100%' }}>
                <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>💬</span> AI 커리어 코치의 따뜻한 제언
                </h4>
                <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.7', fontStyle: 'italic', margin: 0 }}>
                  "조직의 주춧돌이자 인재 성장의 나침반인 HR 직무에서 묵묵히 다져오신 {persona.primarySkill} 스페셜티는 
                  단순한 직무 전문성에 그치지 않고, 비즈니스 전략과 구성원의 마음을 잇는 독보적인 소프트 파워로 진화하고 있습니다.<br/><br/>
                  현재 사용자님은 {diagnosis.careerPhase === 'Transition Ready' ? '현장 파트너로서 쌓아온 탄탄한 문제해결 노하우를 바탕으로, 전사적 전략 제도나 교육 설계로 확장하기에 가장 황홀하고 강력한 기회의 교차로에 서 계십니다.' : '보유하신 핵심 역량을 정량화하고 가치화하여 스스로의 스펙트럼을 넓혀가는 성장 궤도를 달리고 있습니다.'}<br/><br/>
                  이전 단계의 성취를 리치 자산 삼아, '내일의 나'를 향해 두려움 없이 전진하십시오. AI 코칭 리포트가 그 여정을 온전히 지지하고 돕겠습니다."
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: SCENARIOS */}
          {activeTab === 'scenarios' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
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
                        {rec.type === 'optimal' ? '최적 경로 ⭐' : rec.type === 'safe' ? '안정 경로' : '대안 경로'}
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
                    <strong>왜 이 추천이 현재 상태에 맞을까요?</strong><br/>
                    {rec.reason}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: TIMELINE (ACTION PLAN) */}
          {activeTab === 'timeline' && diagnosis.actionPlan && (
            <div>
              <div style={{ background: 'rgba(167, 139, 250, 0.05)', border: '1px solid rgba(167, 139, 250, 0.15)', padding: '16px 20px', borderRadius: '10px', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎯</span> 실행 로드맵 대상: <strong style={{ color: 'var(--accent-purple)' }}>{diagnosis.actionPlan.optimalTitle}</strong>
                </h4>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                  가장 높은 시너지와 매칭 성공 확률을 가진 1순위 타겟 경로로의 연착륙을 돕는 단계별 180일 초밀착 실행 가이드라인입니다.
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
                    STEP 1: 30일
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>Current State</span>
                    <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['30day'].current}</p>
                  </div>
                  <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--accent-purple)', fontWeight: 'bold', display: 'block' }}>Target Goal</span>
                    <p style={{ fontSize: '12px', color: '#fff', fontWeight: '600', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['30day'].target}</p>
                  </div>
                  <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '10px', color: '#f87171', fontWeight: 'bold', display: 'block' }}>💡 Gap (역량 차이)</span>
                    <p style={{ fontSize: '12px', color: '#fca5a5', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['30day'].gap}</p>
                  </div>
                  <div style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px dashed rgba(6, 182, 212, 0.15)', padding: '12px', borderRadius: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 'bold', display: 'block' }}>🚀 구체적 실행 행동 (Action)</span>
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
                    STEP 2: 90일
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>Current State</span>
                    <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['90day'].current}</p>
                  </div>
                  <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--accent-purple)', fontWeight: 'bold', display: 'block' }}>Target Goal</span>
                    <p style={{ fontSize: '12px', color: '#fff', fontWeight: '600', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['90day'].target}</p>
                  </div>
                  <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '10px', color: '#f87171', fontWeight: 'bold', display: 'block' }}>💡 Gap (역량 차이)</span>
                    <p style={{ fontSize: '12px', color: '#fca5a5', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['90day'].gap}</p>
                  </div>
                  <div style={{ background: 'rgba(167, 139, 250, 0.05)', border: '1px dashed rgba(167, 139, 250, 0.15)', padding: '12px', borderRadius: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--accent-purple)', fontWeight: 'bold', display: 'block' }}>🚀 구체적 실행 행동 (Action)</span>
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
                    STEP 3: 6개월
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>Current State</span>
                    <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['6month'].current}</p>
                  </div>
                  <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--accent-purple)', fontWeight: 'bold', display: 'block' }}>Target Goal</span>
                    <p style={{ fontSize: '12px', color: '#fff', fontWeight: '600', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['6month'].target}</p>
                  </div>
                  <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '10px', color: '#f87171', fontWeight: 'bold', display: 'block' }}>💡 Gap (역량 차이)</span>
                    <p style={{ fontSize: '12px', color: '#fca5a5', margin: '2px 0 0 0', lineHeight: '1.4' }}>{diagnosis.actionPlan['6month'].gap}</p>
                  </div>
                  <div style={{ background: 'rgba(236, 72, 153, 0.05)', border: '1px dashed rgba(236, 72, 153, 0.15)', padding: '12px', borderRadius: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--accent-pink)', fontWeight: 'bold', display: 'block' }}>🚀 구체적 실행 행동 (Action)</span>
                    <p style={{ fontSize: '11px', color: '#cbd5e1', margin: '2px 0 0 0', lineHeight: '1.5' }}>{diagnosis.actionPlan['6month'].action}</p>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
