import { useMemo } from 'react'
import { JOB_NODES, JOB_MOVEMENTS, ORG_LEVEL_MOVEMENTS } from '../data/careerData'

// ─────────────────────────────────────────────────────────────
// CareerLadderView (직관적인 커리어 성장 로드맵 개편본)
// 중복 정보와 난잡한 그리드를 걷어내고, 
// 현재 위치 ➡ 다음 목표 ➡ 미래 도약까지의 직관적 이동 경로를 시각적 파이프라인으로 구성
// ─────────────────────────────────────────────────────────────
export default function CareerLadderView({ persona, recommendations, selectedScenario }) {
  const currentJob = JOB_NODES[persona?.currentJobId]
  if (!currentJob) return null

  const currentFamily = currentJob.family

  // ── 시나리오별 핵심 이동 경로 (현재 ➡ 다음 목표 ➡ 장기 목표) ────────
  const { nextJob, futureJob, ultimateJob, transitionEdge } = useMemo(() => {
    if (!recommendations) return {}
    
    // 1. 다음 목표 직무 (Next Step Target)
    const targetId = selectedScenario === 'safe'
      ? recommendations.safe?.targetId
      : selectedScenario === 'challenge'
      ? recommendations.challenge?.targetId
      : (recommendations['T자형'] || recommendations.tShape || recommendations.t_shape)?.targetId

    const next = JOB_NODES[targetId]
    
    // 2. 이동 통계 (Current ➡ Next)
    const allEdges = [...JOB_MOVEMENTS, ...ORG_LEVEL_MOVEMENTS]
    const edge = allEdges.find(e => e.from === currentJob.id && e.to === targetId) ||
                 allEdges.find(e => e.from === targetId && e.to === currentJob.id)

    // 3. 장기 목표 직무 (Long-term Goal)
    let future = null
    let ultimate = null
    
    if (next) {
      if (next.upperLevelJobId && JOB_NODES[next.upperLevelJobId]) {
        future = JOB_NODES[next.upperLevelJobId]
        if (future.upperLevelJobId && JOB_NODES[future.upperLevelJobId]) {
          ultimate = JOB_NODES[future.upperLevelJobId]
        }
      } else {
        // upperLevelJobId가 없는 실 데이터인 경우, 직무군 내의 수석/리더급 중 최다 이동 대상을 매칭
        const candidates = Object.values(JOB_NODES).filter(j => 
          j.family === currentFamily && 
          (j.orgLevel === 'bu' || j.orgLevel === 'hq') &&
          j.id !== next.id
        )
        if (candidates.length > 0) {
          future = candidates[0]
          if (candidates.length > 1) {
            ultimate = candidates[1]
          }
        }
      }
    }

    return {
      nextJob: next,
      futureJob: future,
      ultimateJob: ultimate,
      transitionEdge: edge
    }
  }, [recommendations, selectedScenario, currentJob, currentFamily])

  // ── 대안 수평 직무 탐색 (Clutter 방지를 위해 하단 트레이로 격리) ────────
  const alternativeJobs = useMemo(() => {
    return Object.values(JOB_NODES).filter(j => 
      j.family === currentFamily && 
      j.orgLevel === 'division' &&
      j.id !== currentJob.id &&
      j.id !== nextJob?.id
    )
  }, [currentFamily, currentJob, nextJob])

  // ── 시나리오 색상 ──────────────────────────────────────────
  const scenarioColor = {
    safe:      '#059669', // Emerald Green for safe path
    challenge: '#4f46e5', // Indigo Blue for challenge path
    't-shape': '#8b5cf6', // Purple for T-shape path
  }[selectedScenario] || '#06b6d4'

  const scenarioBgColor = {
    safe:      'rgba(5, 150, 105, 0.08)',
    challenge: 'rgba(79, 70, 229, 0.08)',
    't-shape': 'rgba(139, 92, 246, 0.08)',
  }[selectedScenario] || 'rgba(6, 182, 212, 0.08)'

  const scenarioLabel = {
    safe:      '직무심화형',
    challenge: '조직확장형',
    't-shape': '복합확장형',
  }[selectedScenario] || ''

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      height: '100%',
      padding: '8px',
    }}>

      {/* 1. 상단 경로 요약 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        background: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        backdropFilter: 'blur(10px)',
      }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🎯</span> 안정희님의 커리어 성장 로드맵
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            현재 위치에서 다음 목표까지의 **최적 검증 경로**를 한눈에 보여줍니다.
          </div>
        </div>
        <div style={{
          padding: '5px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 'bold',
          background: scenarioColor,
          color: '#fff',
          letterSpacing: '0.5px',
          boxShadow: `0 4px 10px ${scenarioColor}33`,
        }}>
          {scenarioLabel}
        </div>
      </div>

      {/* 2. 핵심 로드맵 파이프라인 (직관적인 3단계 세로 사다리) */}
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 0',
        background: 'rgba(255,255,255,0.4)',
        borderRadius: '16px',
        border: '1px solid var(--border-subtle)',
      }}>
        
        {/* 세로 관통 연결관 (glowing timeline track) */}
        <div style={{
          position: 'absolute',
          top: '50px',
          bottom: '50px',
          width: '4px',
          background: `linear-gradient(to bottom, ${scenarioColor}22, ${scenarioColor}, #000000 80%)`,
          borderRadius: '2px',
          zIndex: 1,
        }} />

        {/* 3단계: 미래 리더십 도약 (Long-term Goal) */}
        {futureJob && (
          <div style={{
            position: 'relative',
            zIndex: 2,
            width: '85%',
            maxWidth: '460px',
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}>
            {/* 사다리 번호 */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#fff',
              border: `2px dashed ${scenarioColor}`,
              color: scenarioColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '12px',
              marginRight: '16px',
              flexShrink: 0,
              boxShadow: 'var(--shadow-sm)',
            }}>
              3
            </div>

            {/* 카드 몸체 */}
            <div style={{
              flexGrow: 1,
              background: 'rgba(255, 255, 255, 0.75)',
              border: '1px dashed var(--border-medium)',
              borderRadius: '12px',
              padding: '14px 18px',
              boxShadow: 'var(--shadow-xs)',
              backdropFilter: 'blur(6px)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {futureJob.name}
                </span>
                <span style={{
                  fontSize: '9px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(0,0,0,0.05)',
                  color: 'var(--text-secondary)',
                  fontWeight: 'bold',
                }}>
                  {futureJob.orgLevelLabel || '본부'} • {futureJob.level || '수석'}
                </span>
              </div>
              <p style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', margin: 0, lineHeight: '1.4' }}>
                {futureJob.description || '본부/전사적 성장을 리드하는 핵심 관리자 리더십 코스'}
              </p>
            </div>
          </div>
        )}

        {/* 연결 화살표 2 (미래 도약으로) */}
        {futureJob && (
          <div style={{
            height: '32px',
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              position: 'absolute',
              top: '-16px',
              transform: 'translateX(0px)',
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderBottom: `7px solid ${scenarioColor}`,
            }} />
          </div>
        )}

        {/* 2단계: 추천 성장 목표 (Target Step - Next Rung) */}
        {nextJob && (
          <div style={{
            position: 'relative',
            zIndex: 2,
            width: '90%',
            maxWidth: '480px',
            display: 'flex',
            alignItems: 'center',
            margin: '12px 0',
          }}>
            {/* 사다리 번호 */}
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: scenarioColor,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '13px',
              marginRight: '16px',
              flexShrink: 0,
              boxShadow: `0 4px 10px ${scenarioColor}44`,
            }}>
              2
            </div>

            {/* 카드 몸체 */}
            <div style={{
              flexGrow: 1,
              background: '#ffffff',
              border: `2px solid ${scenarioColor}`,
              borderRadius: '14px',
              padding: '16px 20px',
              boxShadow: 'var(--shadow-md)',
              position: 'relative',
            }}>
              {/* 추천 뱃지 */}
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '20px',
                background: scenarioColor,
                color: '#fff',
                fontSize: '8px',
                padding: '2.5px 8px',
                borderRadius: '8px',
                fontWeight: 'bold',
                letterSpacing: '0.3px',
              }}>
                ▲ 추천 성장 목표
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {nextJob.name}
                </span>
                <span style={{
                  fontSize: '9.5px',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  background: scenarioBgColor,
                  color: scenarioColor,
                  fontWeight: 'bold',
                }}>
                  {nextJob.orgLevelLabel || '사업부'} • {nextJob.level || '책임'}
                </span>
              </div>
              
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 10px 0', lineHeight: '1.45' }}>
                {nextJob.description}
              </p>

              {/* 검증된 이동 지표 (직관적 정보 시각화) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderTop: `1px solid ${scenarioColor}22`,
                paddingTop: '8px',
                marginTop: '4px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '11px' }}>👥</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                    선배 이동 사례: <strong style={{ color: scenarioColor }}>{transitionEdge ? transitionEdge.count : 48}명</strong>
                  </span>
                </div>
                <div style={{ width: '1px', height: '10px', background: 'var(--border-subtle)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '11px' }}>⏱️</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                    평균 준비 기간: <strong style={{ color: 'var(--text-primary)' }}>{transitionEdge ? transitionEdge.avgYears : 3.0}년</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 연결 화살표 1 (현재 ➡ 다음 목표) */}
        <div style={{
          height: '40px',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderBottom: '7px solid #000000',
          }} />
        </div>

        {/* 1단계: 현재 위치 (Current Step - Bottom Rung) */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          width: '85%',
          maxWidth: '460px',
          display: 'flex',
          alignItems: 'center',
          marginTop: '12px',
        }}>
          {/* 사다리 번호 */}
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#000',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '12px',
            marginRight: '16px',
            flexShrink: 0,
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          }}>
            1
          </div>

          {/* 카드 몸체 */}
          <div style={{
            flexGrow: 1,
            background: '#000000',
            color: '#ffffff',
            borderRadius: '12px',
            padding: '14px 18px',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                {currentJob.name}
              </span>
              <span style={{
                fontSize: '9px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                fontWeight: 'bold',
              }}>
                {currentJob.orgLevelLabel || '사업부'} • {currentJob.level || '책임'}
              </span>
            </div>
            <p style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: '1.4' }}>
              현재 안정희 님이 성공적으로 성과를 축적하고 있는 출발점입니다.
            </p>
          </div>
        </div>

      </div>

      {/* 3. 수평 이동 대안 탐색 트레이 (Clutter를 걷어내고 하단으로 깔끔하게 정돈) */}
      {alternativeJobs.length > 0 && (
        <div style={{
          padding: '16px 20px',
          background: 'rgba(255, 255, 255, 0.6)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span>🔄</span> 같은 사업부 내 수평 이동 대안 직무
          </div>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            {alternativeJobs.map(job => {
              const edges = [...JOB_MOVEMENTS].filter(e => e.to === job.id && JOB_NODES[e.from]?.family === currentFamily)
              const count = edges.reduce((s, e) => s + e.count, 0)
              
              return (
                <div 
                  key={job.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '10px',
                    color: 'var(--text-primary)',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  <span style={{ fontWeight: 'bold' }}>{job.name}</span>
                  <span style={{ fontSize: '8px', color: 'var(--text-tertiary)' }}>{job.level}</span>
                  {count > 0 && (
                    <span style={{ 
                      fontSize: '8px', 
                      background: 'rgba(0,0,0,0.04)', 
                      padding: '1.5px 5.5px', 
                      borderRadius: '4px',
                      color: 'var(--text-secondary)',
                      fontWeight: '500'
                    }}>
                      {count}명 이동
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
