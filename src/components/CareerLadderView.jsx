import { useMemo } from 'react'
import { JOB_NODES, JOB_MOVEMENTS, ORG_LEVEL_MOVEMENTS } from '../data/careerData'

// ─────────────────────────────────────────────────────────────
// CareerLadderView
// 5~15년차 대상 "커리어 사다리" 시각화
// Y축: 조직 레벨 (사업부 → 본부 → 본사)
// X축: 직무 전문성 (인접 직무 수평 이동)
// ─────────────────────────────────────────────────────────────
export default function CareerLadderView({ persona, recommendations, selectedScenario }) {
  const currentJob = JOB_NODES[persona?.currentJobId]
  if (!currentJob) return null

  const currentFamily = currentJob.family
  const currentOrgLevel = currentJob.orgLevel || 'division'

  // ── 조직 레벨별 같은 family 직무 수집 ──────────────────────
  const jobsByLevel = useMemo(() => {
    const all = Object.values(JOB_NODES).filter(j => j.family === currentFamily)
    return {
      hq:       all.filter(j => j.orgLevel === 'hq'),
      bu:       all.filter(j => j.orgLevel === 'bu'),
      division: all.filter(j => j.orgLevel === 'division'),
    }
  }, [currentFamily])

  // ── 시나리오별 하이라이트 직무 ────────────────────────────
  const targetJobId = useMemo(() => {
    if (!recommendations) return null
    if (selectedScenario === 'safe')      return recommendations.safe?.targetId
    if (selectedScenario === 'challenge') return recommendations.challenge?.targetId
    return (recommendations['T자형'] || recommendations.tShape)?.targetId
  }, [recommendations, selectedScenario])

  // ── 이동 엣지 통합 (수평 + 수직) ─────────────────────────
  const allEdges = useMemo(() => [
    ...JOB_MOVEMENTS,
    ...ORG_LEVEL_MOVEMENTS
  ], [])

  // 두 직무 간 이동 데이터 조회
  const getEdge = (fromId, toId) =>
    allEdges.find(e => e.from === fromId && e.to === toId) ||
    allEdges.find(e => e.from === toId   && e.to === fromId)

  // ── 시나리오 색상 ──────────────────────────────────────────
  const scenarioColor = {
    safe:      'var(--scenario-safe)',
    challenge: 'var(--scenario-challenge)',
    't-shape': 'var(--scenario-t-shape)',
  }[selectedScenario] || '#06b6d4'

  const scenarioLabel = {
    safe:      '직무심화형',
    challenge: '조직확장형',
    't-shape': '복합확장형',
  }[selectedScenario] || ''

  // ── 레벨별 렌더링 설정 ────────────────────────────────────
  const levels = [
    { key: 'hq',       label: '본사 (HQ)',     sub: 'Corporate HQ',    icon: '🏢', badge: '#000000', badgeText: '#fff' },
    { key: 'bu',       label: '본부 (BU)',      sub: 'Business Unit',   icon: '🏛️', badge: '#1f2937', badgeText: '#fff' },
    { key: 'division', label: '사업부 (Division)', sub: 'Division Level', icon: '🏗️', badge: '#4b5563', badgeText: '#fff' },
  ]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0px',
      height: '100%',
      padding: '0 8px',
      overflowY: 'auto',
    }}>

      {/* 상단 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        padding: '12px 16px',
        background: 'rgba(0,0,0,0.03)',
        borderRadius: '10px',
        border: '1px solid var(--border-subtle)',
      }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {persona.name}님의 커리어 사다리
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {currentFamily} 직무군 · {currentJob.orgLevelLabel} 현재 위치
          </div>
        </div>
        <div style={{
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 'bold',
          background: scenarioColor,
          color: '#fff',
          letterSpacing: '0.3px',
        }}>
          {scenarioLabel}
        </div>
      </div>

      {/* 사다리 본체 */}
      {levels.map((levelInfo, levelIdx) => {
        const jobs = jobsByLevel[levelInfo.key] || []
        if (jobs.length === 0) return null

        const isCurrentLevel = levelInfo.key === currentOrgLevel

        return (
          <div key={levelInfo.key} style={{ display: 'flex', flexDirection: 'column' }}>

            {/* 화살표 + 소요기간 (본사/본부 위에만) */}
            {levelIdx > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 0',
                position: 'relative',
              }}>
                <div style={{
                  width: '2px',
                  height: '28px',
                  background: 'linear-gradient(to top, #6366f1, #a5b4fc)',
                  borderRadius: '1px',
                }} />
                {/* 화살표 */}
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderBottom: '8px solid #6366f1',
                }} />
                {/* 이동 통계 뱃지 */}
                {(() => {
                  const prevLevel = levels[levelIdx - 1]
                  const prevJobs = jobsByLevel[prevLevel.key] || []
                  const currentLevelJobs = jobs

                  // 현재 레벨 → 위 레벨 이동 엣지들
                  const upwardEdges = ORG_LEVEL_MOVEMENTS.filter(e => {
                    const fromJob = JOB_NODES[e.from]
                    const toJob   = JOB_NODES[e.to]
                    return fromJob?.family === currentFamily &&
                           fromJob?.orgLevel === levelInfo.key &&
                           toJob?.family === currentFamily &&
                           toJob?.orgLevel === prevLevel.key
                  })
                  const totalCount = upwardEdges.reduce((s, e) => s + e.count, 0)
                  const avgYears   = upwardEdges.length > 0
                    ? (upwardEdges.reduce((s, e) => s + e.avgYears * e.count, 0) / totalCount).toFixed(1)
                    : '—'

                  return totalCount > 0 ? (
                    <div style={{
                      position: 'absolute',
                      left: 'calc(50% + 14px)',
                      top: '4px',
                      display: 'flex',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                    }}>
                      <span style={{
                        fontSize: '9px', padding: '2px 7px',
                        background: 'rgba(99,102,241,0.1)', color: '#6366f1',
                        borderRadius: '10px', fontWeight: 'bold',
                      }}>
                        실제 {totalCount}명
                      </span>
                      <span style={{
                        fontSize: '9px', padding: '2px 7px',
                        background: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)',
                        borderRadius: '10px',
                      }}>
                        평균 {avgYears}년
                      </span>
                    </div>
                  ) : null
                })()}
              </div>
            )}

            {/* 레벨 밴드 */}
            <div style={{
              borderRadius: '12px',
              border: isCurrentLevel ? '2px solid rgba(0,0,0,0.15)' : '1px solid var(--border-subtle)',
              background: isCurrentLevel ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.01)',
              padding: '14px',
              position: 'relative',
              overflow: 'hidden',
            }}>

              {/* 레벨 라벨 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}>
                <span style={{ fontSize: '14px' }}>{levelInfo.icon}</span>
                <div>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: levelInfo.badge,
                  }}>
                    {levelInfo.label}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>
                    {levelInfo.sub}
                  </div>
                </div>
                {isCurrentLevel && (
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: '#000',
                    color: '#fff',
                    fontWeight: 'bold',
                  }}>
                    ← 현재 레벨
                  </span>
                )}
              </div>

              {/* 직무 노드들 */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}>
                {jobs.map(job => {
                  const isCurrent  = job.id === persona.currentJobId
                  const isTarget   = job.id === targetJobId
                  const edge       = isCurrent ? null : getEdge(persona.currentJobId, job.id)

                  // 이 직무로의 이동 통계
                  const incomingEdges = allEdges.filter(e => e.to === job.id && JOB_NODES[e.from]?.family === currentFamily)
                  const totalMovers   = incomingEdges.reduce((s, e) => s + e.count, 0)
                  const avgYears      = incomingEdges.length > 0
                    ? (incomingEdges.reduce((s, e) => s + e.avgYears * e.count, 0) / (totalMovers || 1)).toFixed(1)
                    : null

                  return (
                    <div
                      key={job.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        minWidth: '90px',
                        maxWidth: '120px',
                        flex: '1 1 90px',
                        background: isCurrent  ? '#000000'
                                  : isTarget   ? `${scenarioColor}18`
                                  : 'rgba(0,0,0,0.03)',
                        border: isCurrent  ? '2px solid #000'
                              : isTarget   ? `2px solid ${scenarioColor}`
                              : '1px solid var(--border-subtle)',
                        boxShadow: isTarget ? `0 0 0 3px ${scenarioColor}22` : 'none',
                        transition: 'all 0.2s',
                        cursor: 'default',
                        position: 'relative',
                      }}
                    >
                      {/* 타겟 표시 */}
                      {isTarget && !isCurrent && (
                        <div style={{
                          position: 'absolute',
                          top: '-8px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: scenarioColor,
                          color: '#fff',
                          fontSize: '8px',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                        }}>
                          ▲ 목표
                        </div>
                      )}

                      {/* 직무명 */}
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: isCurrent ? '#ffffff' : isTarget ? 'var(--text-primary)' : 'var(--text-primary)',
                        textAlign: 'center',
                        lineHeight: 1.3,
                      }}>
                        {job.name}
                      </span>

                      {/* 직급 */}
                      <span style={{
                        fontSize: '9px',
                        color: isCurrent ? 'rgba(255,255,255,0.7)' : 'var(--text-tertiary)',
                      }}>
                        {job.level}
                      </span>

                      {/* 이동 통계 */}
                      {!isCurrent && totalMovers > 0 && (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px',
                          marginTop: '2px',
                          paddingTop: '6px',
                          borderTop: `1px solid ${isTarget ? `${scenarioColor}44` : 'var(--border-subtle)'}`,
                          width: '100%',
                        }}>
                          <span style={{
                            fontSize: '9px',
                            color: isTarget ? scenarioColor : 'var(--text-secondary)',
                            fontWeight: isTarget ? 'bold' : 'normal',
                          }}>
                            {totalMovers}명 이동
                          </span>
                          {avgYears && (
                            <span style={{ fontSize: '8px', color: 'var(--text-tertiary)' }}>
                              평균 {avgYears}년
                            </span>
                          )}
                        </div>
                      )}

                      {/* 현재 직무 표시 */}
                      {isCurrent && (
                        <span style={{
                          fontSize: '9px',
                          color: 'rgba(255,255,255,0.8)',
                          marginTop: '2px',
                          paddingTop: '4px',
                          borderTop: '1px solid rgba(255,255,255,0.2)',
                          width: '100%',
                          textAlign: 'center',
                        }}>
                          현재 위치
                        </span>
                      )}

                      {/* 허브/리더십 배지 */}
                      {(job.isHub || job.isLeadership) && !isCurrent && (
                        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          {job.isHub && (
                            <span style={{
                              fontSize: '8px', padding: '1px 4px',
                              background: 'rgba(0,0,0,0.08)',
                              borderRadius: '4px', color: 'var(--text-secondary)',
                            }}>HUB</span>
                          )}
                          {job.isLeadership && (
                            <span style={{
                              fontSize: '8px', padding: '1px 4px',
                              background: 'rgba(0,0,0,0.08)',
                              borderRadius: '4px', color: 'var(--text-secondary)',
                            }}>리더십</span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}

      {/* 하단 범례 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        marginTop: '16px',
        padding: '10px 14px',
        background: 'rgba(0,0,0,0.02)',
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', fontWeight: 'bold', width: '100%', marginBottom: '4px' }}>
          범례
        </div>
        {[
          { color: '#000', label: '현재 직무' },
          { color: scenarioColor, label: '추천 목표', dashed: true },
          { color: '#6366f1', label: '조직 레벨 상승 경로' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{
              width: '12px', height: '12px', borderRadius: '3px',
              background: item.color,
              border: item.dashed ? `2px dashed ${item.color}` : 'none',
              opacity: item.dashed ? 0.4 : 1,
            }} />
            <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
