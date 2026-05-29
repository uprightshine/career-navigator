import { useState, useEffect, useMemo } from 'react'

// 직군별 맞춤형 디폴트 마일스톤 및 교육/프로젝트 바 정의
const DEFAULT_MILESTONES_BY_FAMILY = {
  'R&D': [
    { type: 'edu', label: 'Aalto MBA', start: '35%', width: '25%', top: '68%' },
    { type: 'project', label: '매트리스, 욕실정수기', start: '18%', width: '15%', top: '55%' },
    { type: 'leadership', label: '로보타이즈가전 Project 리더', start: '52%', width: '20%', top: '48%' },
    { type: 'leadership', label: '신사업개발Task 리더', start: '72%', width: '18%', top: '52%' }
  ],
  '마케팅': [
    { type: 'edu', label: 'Global MBA', start: '38%', width: '22%', top: '68%' },
    { type: 'project', label: '신제품 마케팅 Task', start: '20%', width: '15%', top: '55%' },
    { type: 'leadership', label: '통합 마케팅 PM', start: '48%', width: '18%', top: '48%' },
    { type: 'leadership', label: '본부 마케팅 전략 실장', start: '70%', width: '20%', top: '52%' }
  ],
  'HR': [
    { type: 'edu', label: 'HR 전문과정/MBA', start: '36%', width: '24%', top: '68%' },
    { type: 'project', label: '인사 기획 Task', start: '20%', width: '15%', top: '55%' },
    { type: 'leadership', label: '본부 HRBP 총괄', start: '50%', width: '18%', top: '48%' },
    { type: 'leadership', label: '인사 기획 팀장', start: '70%', width: '18%', top: '52%' }
  ],
  '영업': [
    { type: 'edu', label: '해외 MBA', start: '38%', width: '22%', top: '68%' },
    { type: 'project', label: '영업 채널 혁신 Task', start: '18%', width: '15%', top: '55%' },
    { type: 'leadership', label: '본부 영업 기획 총괄', start: '50%', width: '18%', top: '48%' },
    { type: 'leadership', label: '글로벌 사업 실장', start: '72%', width: '18%', top: '52%' }
  ]
}

// 직군별 미래/장기 타임라인 디폴트 텍스트 템플릿
const TIMELINE_TEMPLATES_BY_FAMILY = {
  'R&D': {
    nurture: {
      job: ['욕실정수기(신제품/신사업)', '세탁기', 'HS'],
      role: ['신제품 Task', '세탁기 개발Project', 'Signature PMO']
    },
    future: {
      job: ['로봇', 'HS(CTO)'],
      role: ['로보타이즈가전 Project 리더', '차세대플랫폼 Task 내 Pjt 리더', '신사업개발Task 리더', '차세대플랫폼 연구실장', 'HS선행연구소장(CTO)', 'HS기반기술 연구소장']
    }
  },
  '마케팅': {
    nurture: {
      job: ['브랜드 마케팅', '통합 마케팅 PM', '글로벌 마케팅 PM'],
      role: ['신제품 마케팅 Task', '통합 마케팅 PM', '글로벌 MBA / 해외 연수']
    },
    future: {
      job: ['마케팅 전략', '전사 브랜드 전략'],
      role: ['마케팅 기획 팀장', '본부 마케팅 전략 실장', 'CMO 임원(CMO)', '전사 브랜드 총괄']
    }
  },
  'HR': {
    nurture: {
      job: ['HRBP 실무', 'HRD 기획', '인사 기획'],
      role: ['HRBP 파트너', '인사 기획 Task', 'HR 전문 과정 / MBA']
    },
    future: {
      job: ['본부 HRBP 총괄', '인사 기획 팀장'],
      role: ['HRBP 팀장', '본부 HRBP 실장', '인사기획 팀장', '전사 인사기획 실장', 'CHO 임원']
    }
  },
  '영업': {
    nurture: {
      job: ['KAM 핵심영업', '영업기획 PM', '해외사업 PM'],
      role: ['KAM 채널 리더', '영업기획 파트장', '해외사업 기획']
    },
    future: {
      job: ['채널 영업 팀장', '본부 영업기획 실장'],
      role: ['채널 영업 팀장', '본부 영업기획 실장', '해외 영업 팀장', 'CCO 임원', '글로벌 사업부장']
    }
  }
}

// 품격 있는 LGE Corporate Career Goal 텍스트 실시간 생성기
function generateDynamicGoals(persona, selectedScenario, targetJobName) {
  const currentJobName = persona.currentJobName
  const family = persona._family || '전문'
  const scenarioLabel = selectedScenario === 'safe' ? '직무심화형' : selectedScenario === 'challenge' ? '조직확장형' : '복합확장형'
  
  return {
    short: `• 현재 직무인 [${currentJobName}] 영역에서의 핵심 실무 역량을 완벽히 내재화하고, ${scenarioLabel} 성장에 발맞추어 [${targetJobName}]로의 성공적인 연계 전환을 달성함\n• 소속 직군 내 선배들의 실제 이동 성공 선례 통계를 분석하여, 해당 직무 전보에 필요한 1차 역량 요건(스킬 갭)의 보완 계획 수립 및 자가개발 완료`,
    medium: `• [${family}] 직군 내 허브 직무를 경험하며 본부 단위의 기술적/사업적 조율 역량을 배양하고, 주요 사업본부의 대형 크로스 펑셔널(Cross-functional) 프로젝트 리더를 역임함\n• 4~6년 내에 임직원 리더급 지위를 확보하고, Signature 제품 개발 또는 본부 전략 기획 PMO를 리딩하여 사업가적 역량을 조기에 육성/강화함`,
    long: `• 최종 육성 목표인 [${targetJobName}] 직무 보임을 마침내 달성하고, [${family}] 부문의 미래 기술/사업 전략적 의사결정을 리딩하는 총괄 책임자(임원 및 소장)로서의 최고 리더십을 발휘하고자 함`
  }
}

export default function LgeSlideRoadmapView({ persona, selectedScenario, recommendations }) {
  const personaId = persona.id || 'EMP003'
  
  // 1. 현재 직무군(family) 및 타겟 직무 이름 동적 판별
  const currentFamily = useMemo(() => {
    return persona._family || (persona.currentJobId?.includes('HR') ? 'HR' : persona.currentJobId?.includes('MKT') ? '마케팅' : persona.currentJobId?.includes('SALES') ? '영업' : 'R&D')
  }, [persona])

  const targetJobName = useMemo(() => {
    if (!recommendations) return '목표 직무'
    const scenarioKey = selectedScenario === 'safe' ? 'safe' : selectedScenario === 'challenge' ? 'challenge' : 'T자형'
    const targetObj = recommendations[scenarioKey]
    return targetObj ? targetObj.name : '목표 직무'
  }, [recommendations, selectedScenario])

  // 2. 과거/미래 연도 및 나이 동적 계산 (onboarding 입력값 기준 100% 동기화)
  const dynamicYearsAndAges = useMemo(() => {
    const currentYear = new Date().getFullYear() // 2025년 또는 2026년
    const joinYear = persona.joinYear || (currentYear - persona.totalYears)
    const age = persona.age || 35
    
    const pastYearEnd = currentYear - 3
    const pastAgeEnd = age - 3
    
    return {
      past: {
        year: `${joinYear}년 ~ ${pastYearEnd}년`,
        age: `${age - persona.totalYears}세 ~ ${pastAgeEnd}세`,
        sepYear: `${pastYearEnd + 1}년`,
        sepAge: `${pastAgeEnd + 1}세`
      },
      nurture: {
        year: `${pastYearEnd + 1}년 ~ ${currentYear}년`,
        age: `${pastAgeEnd + 1}세 ~ ${age}세`
      },
      future: {
        year: `${currentYear + 2}년 ~ ${currentYear + 7}년`,
        age: `${age + 2}세 ~ ${age + 7}세`
      }
    }
  }, [persona])

  // 3. 로컬 상태 관리 (수정본은 localStorage에 저장하여 보존)
  const [goals, setGoals] = useState({ short: '', medium: '', long: '' })
  const [timeline, setTimeline] = useState({ past: { job: [], role: [] }, nurture: { job: [], role: [] }, future: { job: [], role: [] } })

  // 데이터 동적 조립 엔진
  useEffect(() => {
    const saved = localStorage.getItem(`lge_roadmap_dynamic_${personaId}_${selectedScenario}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // 만약 저장된 데이터가 있어도 타겟 직무가 실시간으로 변경되었다면 자주색 상자는 실시간 강제 업데이트 처리!
        const updatedTimeline = { ...parsed.timeline }
        if (updatedTimeline.future && updatedTimeline.future.job) {
          updatedTimeline.future.job[2] = targetJobName
        }
        setGoals(parsed.goals)
        setTimeline(updatedTimeline)
        return
      } catch (e) {
        console.error('Failed to parse saved dynamic roadmap', e)
      }
    }

    // A. 과거 이력 조립 (movementHistory가 있으면 그대로 반영!)
    const pastJobs = []
    const pastRoles = []
    
    if (persona.movementHistory && persona.movementHistory.length > 0) {
      persona.movementHistory.forEach(item => {
        pastJobs.push(item.jobName)
        // 직책이 따로 없으면 직급 기반 조립
        pastRoles.push(persona.grade === '수석' || persona.grade === '책임' ? `${item.jobName} 리더` : `${item.jobName} 담당`)
      })
    }
    
    // 이력이 빈약할 경우 채워주기
    if (pastJobs.length === 0) pastJobs.push(persona.currentJobName || '실무 기초')
    if (pastJobs.length === 1) pastJobs.push('인접 직무 경험')
    if (pastRoles.length === 0) pastRoles.push('실무 담당자')
    if (pastRoles.length === 1) pastRoles.push(`${persona.currentJobName} 선행 개발`)

    // B. 미래 및 장기 이력 템플릿 로드 (직무군 맞춤형)
    const familyTemplate = TIMELINE_TEMPLATES_BY_FAMILY[currentFamily] || TIMELINE_TEMPLATES_BY_FAMILY['R&D']
    
    // C. 최종 타겟 직무명 강제 주입 (자주색 육성 포지션 박스!)
    const futureJobsWithTarget = [...familyTemplate.future.job]
    futureJobsWithTarget[2] = targetJobName // 세 번째 박스를 타겟 직무로 정밀 맵핑!

    // D. 최종 상태 조립
    const generatedTimeline = {
      past: {
        year: dynamicYearsAndAges.past.year,
        age: dynamicYearsAndAges.past.age,
        job: pastJobs.slice(0, 2),
        role: pastRoles.slice(0, 2)
      },
      nurture: {
        year: dynamicYearsAndAges.nurture.year,
        age: dynamicYearsAndAges.nurture.age,
        job: [...familyTemplate.nurture.job],
        role: [...familyTemplate.nurture.role]
      },
      future: {
        year: dynamicYearsAndAges.future.year,
        age: dynamicYearsAndAges.future.age,
        job: futureJobsWithTarget,
        role: [...familyTemplate.future.role]
      }
    }

    const generatedGoals = generateDynamicGoals(persona, selectedScenario, targetJobName)

    setGoals(generatedGoals)
    setTimeline(generatedTimeline)
  }, [personaId, persona, selectedScenario, targetJobName, currentFamily, dynamicYearsAndAges])

  // 값 변경 시 자동 저장 및 캐싱
  const handleGoalChange = (key, value) => {
    const updatedGoals = { ...goals, [key]: value }
    setGoals(updatedGoals)
    localStorage.setItem(`lge_roadmap_dynamic_${personaId}_${selectedScenario}`, JSON.stringify({ goals: updatedGoals, timeline }))
  }

  const handleTimelineChange = (section, key, index, value) => {
    const updatedSection = { ...timeline[section] }
    updatedSection[key][index] = value
    const updatedTimeline = { ...timeline, [section]: updatedSection }
    setTimeline(updatedTimeline)
    localStorage.setItem(`lge_roadmap_dynamic_${personaId}_${selectedScenario}`, JSON.stringify({ goals, timeline: updatedTimeline }))
  }

  // 복원 기능
  const handleReset = () => {
    if (window.confirm('내가 수정한 텍스트를 모두 지우고 알고리즘 기반 생성 템플릿으로 복원하시겠습니까?')) {
      localStorage.removeItem(`lge_roadmap_dynamic_${personaId}_${selectedScenario}`)
      // 트리거용 상태 리셋
      const familyTemplate = TIMELINE_TEMPLATES_BY_FAMILY[currentFamily] || TIMELINE_TEMPLATES_BY_FAMILY['R&D']
      const futureJobsWithTarget = [...familyTemplate.future.job]
      futureJobsWithTarget[2] = targetJobName

      const generatedGoals = generateDynamicGoals(persona, selectedScenario, targetJobName)
      const generatedTimeline = {
        past: {
          year: dynamicYearsAndAges.past.year,
          age: dynamicYearsAndAges.past.age,
          job: (persona.movementHistory && persona.movementHistory.length > 0) ? persona.movementHistory.map(h => h.jobName).slice(0, 2) : [persona.currentJobName, '실무 기틀'],
          role: (persona.movementHistory && persona.movementHistory.length > 0) ? persona.movementHistory.map(h => `${h.jobName} 선행`).slice(0, 2) : ['실무자', '프로젝트 선행'],
        },
        nurture: {
          year: dynamicYearsAndAges.nurture.year,
          age: dynamicYearsAndAges.nurture.age,
          job: [...familyTemplate.nurture.job],
          role: [...familyTemplate.nurture.role]
        },
        future: {
          year: dynamicYearsAndAges.future.year,
          age: dynamicYearsAndAges.future.age,
          job: futureJobsWithTarget,
          role: [...familyTemplate.future.role]
        }
      }
      setGoals(generatedGoals)
      setTimeline(generatedTimeline)
    }
  }

  // 마일스톤 리스트 동적 패치
  const milestones = useMemo(() => {
    return DEFAULT_MILESTONES_BY_FAMILY[currentFamily] || DEFAULT_MILESTONES_BY_FAMILY['R&D']
  }, [currentFamily])

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="lge-roadmap-container animate-fade-in-up">
      {/* 1. 액션 바 (화면만 보임, 인쇄 시 자동 히든) */}
      <div className="lge-roadmap-actions-bar">
        <span className="lge-actions-help-text">
          💡 입력 및 도출된 결과가 반영된 <strong>실시간 성장로드맵</strong>입니다. 문구를 클릭하여 나만의 커리어를 직접 수정하고 PDF로 소장하세요!
        </span>
        <div className="lge-actions-buttons">
          <button onClick={handleReset} className="btn-reset-roadmap">
            🔄 알고리즘 기본 문구 복원
          </button>
          <button onClick={handlePrint} className="btn-print-roadmap">
            🖨️ PDF 다운로드 / 슬라이드 인쇄
          </button>
        </div>
      </div>

      {/* 2. PPT 슬라이드 본판 */}
      <div id="lge-slide-printable" className="lge-ppt-slide">
        {/* 슬라이드 헤더 */}
        <div className="lge-slide-header">
          <div className="lge-slide-title">
            {persona.name} {persona.grade} 개인성장 로드맵
          </div>
          <div className="lge-slide-marker">
            INTERNAL USE ONLY
          </div>
        </div>
        <div className="lge-slide-divider"></div>

        {/* 2-1. Career Goal 영역 */}
        <div className="lge-career-goal-board">
          <div className="lge-goal-label-col">
            <div className="vertical-label-text">Career Goal</div>
          </div>
          
          <div className="lge-goal-col">
            <div className="lge-goal-col-header">단기(~3년)</div>
            <div className="lge-goal-col-body">
              <textarea
                value={goals.short || ''}
                onChange={(e) => handleGoalChange('short', e.target.value)}
                placeholder="단기 경력 성장 골 및 전환 계획을 구체화하세요..."
                className="lge-goal-textarea"
              />
            </div>
          </div>

          <div className="lge-goal-col">
            <div className="lge-goal-col-header">중기(4년~6년)</div>
            <div className="lge-goal-col-body">
              <textarea
                value={goals.medium || ''}
                onChange={(e) => handleGoalChange('medium', e.target.value)}
                placeholder="중기 리더십/직책 확보 및 주도적 PM 프로젝트 과제를 적어주세요..."
                className="lge-goal-textarea"
              />
            </div>
          </div>

          <div className="lge-goal-col">
            <div className="lge-goal-col-header">장기(7년~10년)</div>
            <div className="lge-goal-col-body">
              <textarea
                value={goals.long || ''}
                onChange={(e) => handleGoalChange('long', e.target.value)}
                placeholder="장기 최종 도약 목표 및 리더십 임원 보임 비전을 서술해 주세요..."
                className="lge-goal-textarea"
              />
            </div>
          </div>
        </div>

        {/* 2-2. 성장 경로 영역 */}
        <div className="lge-career-goal-board lge-career-path-board-wrapper" style={{ marginTop: '20px' }}>
          <div className="lge-path-label-col">
            <div className="vertical-label-text">성장 경로</div>
          </div>

          <div className="lge-path-timeline-matrix">
            {/* 타임라인 축 정의 */}
            <div className="lge-timeline-header-row">
              <div className="lge-timeline-header-cell past-header">
                <div className="timeline-title-main">과거 직무 경험</div>
                <div className="timeline-title-sub">
                  {dynamicYearsAndAges.past.year} ({dynamicYearsAndAges.past.age})
                </div>
              </div>
              
              <div className="lge-timeline-header-cell nurture-header">
                <div className="timeline-title-main highlight-text">미래사업가 육성기간</div>
                <div className="timeline-title-sub">
                  {dynamicYearsAndAges.nurture.year} ({dynamicYearsAndAges.nurture.age})
                </div>
              </div>

              <div className="lge-timeline-header-cell future-header">
                <div className="timeline-title-main">장기 육성 방향</div>
                <div className="timeline-title-sub">
                  {dynamicYearsAndAges.future.year} ({dynamicYearsAndAges.future.age})
                </div>
              </div>
            </div>

            {/* 범례 배지 */}
            <div className="lge-slide-legend">
              <span className="legend-badge badge-yellow">호환 가능한 직무/직책</span>
              <span className="legend-badge badge-magenta">육성 Position</span>
            </div>

            {/* 과거/현재 분리 절취선 */}
            <div className="lge-red-separator-line">
              <div className="red-separator-top-tag">
                {dynamicYearsAndAges.past.sepYear} ({dynamicYearsAndAges.past.sepAge})
              </div>
            </div>

            {/* 제품·직무 라인 */}
            <div className="lge-path-row">
              <div className="lge-path-row-header">제품·직무</div>
              <div className="lge-path-row-cells">
                <div className="lge-path-cell-group past-group">
                  {timeline.past?.job?.map((item, idx) => (
                    <input
                      key={`past-job-${idx}`}
                      type="text"
                      value={item || ''}
                      onChange={(e) => handleTimelineChange('past', 'job', idx, e.target.value)}
                      className="lge-path-input"
                    />
                  ))}
                </div>

                <div className="lge-path-cell-group nurture-group">
                  {timeline.nurture?.job?.map((item, idx) => (
                    <input
                      key={`nurture-job-${idx}`}
                      type="text"
                      value={item || ''}
                      onChange={(e) => handleTimelineChange('nurture', 'job', idx, e.target.value)}
                      className="lge-path-input input-yellow-box"
                    />
                  ))}
                </div>

                <div className="lge-path-cell-group future-group">
                  {timeline.future?.job?.slice(0, 2).map((item, idx) => (
                    <input
                      key={`future-job-${idx}`}
                      type="text"
                      value={item || ''}
                      onChange={(e) => handleTimelineChange('future', 'job', idx, e.target.value)}
                      className="lge-path-input"
                    />
                  ))}
                  {timeline.future?.job?.[2] && (
                    <input
                      type="text"
                      value={timeline.future.job[2] || ''}
                      onChange={(e) => handleTimelineChange('future', 'job', 2, e.target.value)}
                      className="lge-path-input input-magenta-box font-bold"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 업무·직책 라인 */}
            <div className="lge-path-row">
              <div className="lge-path-row-header">업무·직책</div>
              <div className="lge-path-row-cells">
                <div className="lge-path-cell-group past-group">
                  {timeline.past?.role?.map((item, idx) => (
                    <input
                      key={`past-role-${idx}`}
                      type="text"
                      value={item || ''}
                      onChange={(e) => handleTimelineChange('past', 'role', idx, e.target.value)}
                      className="lge-path-input"
                    />
                  ))}
                </div>

                <div className="lge-path-cell-group nurture-group">
                  {timeline.nurture?.role?.map((item, idx) => (
                    <input
                      key={`nurture-role-${idx}`}
                      type="text"
                      value={item || ''}
                      onChange={(e) => handleTimelineChange('nurture', 'role', idx, e.target.value)}
                      className="lge-path-input"
                    />
                  ))}
                </div>

                <div className="lge-path-cell-group future-group grid-cols-2">
                  {timeline.future?.role?.map((item, idx) => (
                    <input
                      key={`future-role-${idx}`}
                      type="text"
                      value={item || ''}
                      onChange={(e) => handleTimelineChange('future', 'role', idx, e.target.value)}
                      className="lge-path-input input-dashed-box text-xs"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 절대 좌표 기반 스마트 마일스톤 */}
            <div className="lge-milestones-container">
              {milestones.map((ms, idx) => (
                <div
                  key={`ms-${idx}`}
                  className={`lge-milestone-bar milestone-${ms.type}`}
                  style={{
                    left: ms.start,
                    width: ms.width,
                    top: ms.top
                  }}
                >
                  <span className="milestone-text-label">{ms.label}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
