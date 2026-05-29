import { useState, useEffect } from 'react'

// 각 페르소나별 초기 로드맵 데이터 (PPT 이미지 기반)
const INITIAL_ROADMAPS = {
  'EMP003': { // R&D 윤지현 책임
    goals: {
      short: `• 로봇타이즈가전 Project 리더 경험을 통해 신규 연구분야 리딩 경험 확보\n• CTO HS선행연구소 조직 안정화 및 리더십 확보 과정을 통해 CTO HS선행연구소장 혹은 HS연구센터 내 연구소장 Pool(단기)로 육성`,
      medium: `• 선행연구 전문성에 기반하여 임원(급) 역할을 부여하고, R&D 리더십을 지속 육성/강화함\n• 본부 HS연구센터장 Pool(장기)로 역량과 경험을 육성/강화함\n• 제품개발/Signature PMO 운영 경험을 살려, 차세대플랫폼 혹은 신사업개발의 리더 역할을 부여하고자 함.`,
      long: `• HS본부 R&D 영역의 총괄책임자로서의 심화된 역할 경험을 통해 HS연구센터장 보임 혹은 Pool(단기)로서 역할 부여함`
    },
    timeline: {
      past: {
        year: '21년 이전',
        age: '41세 이전',
        job: ['Linear Comp.', '리빙 신제품'],
        role: ['부품 개발', '리빙 신제품 선행개발 리더']
      },
      nurture: {
        year: '22년 ~ 24년',
        age: '42세 ~ 44세',
        job: ['욕실정수기(신제품/신사업)', '세탁기', 'HS'],
        role: ['신제품 Task', '세탁기 개발Project', 'Signature PMO']
      },
      future: {
        year: '26년 ~ 31년',
        age: '46세 ~ 51세',
        job: ['로봇', 'HS(CTO)', 'HS연구센터장'],
        role: ['로보타이즈가전 Project 리더', '차세대플랫폼 Task 내 Pjt 리더', '신사업개발Task 리더', '차세대플랫폼 연구실장', 'HS선행연구소장(CTO)', 'HS기반기술 연구소장']
      }
    },
    milestones: [
      { type: 'edu', label: 'Aalto MBA', start: '35%', width: '25%', top: '68%' },
      { type: 'project', label: '매트리스, 욕실정수기', start: '18%', width: '15%', top: '55%' },
      { type: 'leadership', label: '로보타이즈가전 Project 리더', start: '52%', width: '20%', top: '48%' },
      { type: 'leadership', label: '신사업개발Task 리더', start: '72%', width: '18%', top: '52%' }
    ]
  },
  'EMP001': { // 마케팅 김선영 선임
    goals: {
      short: `• 퍼포먼스 마케팅 중심의 핵심 디지털 KPI 분석 역량 내재화 및 최적 캠페인 리드\n• 브랜드 마케팅(CMO) 부서 전보 및 통합 마케팅 PM으로서의 실무 경험 확보`,
      medium: `• 마케팅 전략 수립 및 본부 차원의 채널 통합 예산 수립/조율 리더십 확보\n• 글로벌 마케팅 스쿨 연계 및 디지털 트랜스포메이션 마케팅 리더 육성`,
      long: `• CMO 산하의 글로벌 브랜드 총괄 책임자(임원급) 보임 혹은 전사 브랜드 기획 실장 Pool 육성`
    },
    timeline: {
      past: {
        year: '23년 이전',
        age: '28세 이전',
        job: ['디지털 광고', '퍼포먼스 마케팅'],
        role: ['실무자(퍼포먼스)', '캠페인 리더']
      },
      nurture: {
        year: '24년 ~ 26년',
        age: '29세 ~ 31세',
        job: ['브랜드 마케팅', '통합 마케팅 PM', '글로벌 마케팅 PM'],
        role: ['신제품 마케팅 Task', '통합 마케팅 PM', '글로벌 MBA / 해외 연수']
      },
      future: {
        year: '28년 ~ 33년',
        age: '33세 ~ 38세',
        job: ['마케팅 전략', '전사 브랜드 전략', '글로벌 브랜드 총괄'],
        role: ['마케팅 기획 팀장', '본부 마케팅 전략 실장', 'CMO 임원(CMO)']
      }
    },
    milestones: [
      { type: 'edu', label: 'Global MBA', start: '38%', width: '22%', top: '68%' },
      { type: 'project', label: '신제품 마케팅 Task', start: '20%', width: '15%', top: '55%' },
      { type: 'leadership', label: '통합 마케팅 PM', start: '48%', width: '18%', top: '48%' },
      { type: 'leadership', label: '본부 마케팅 전략 실장', start: '70%', width: '20%', top: '52%' }
    ]
  },
  'EMP002': { // HR 박지훈 선임
    goals: {
      short: `• 채용 플랫폼 운영 고도화 및 핵심 인재 소싱 브랜딩 성과 창출\n• HRBP 실무자 역할 수행을 통해 현업 밀착형 파트너십 구축`,
      medium: `• 본부 HRBP 총괄 및 인사기획 팀장 리더십 확보를 통한 조직/제도 설계 능력 배양\n• 임원 인사 및 글로벌 주재원 HR 정책 설계 주도`,
      long: `• 전사 인사기획 임원(CHO 라인) 보임 혹은 전사 HRBP 기획 실장 Pool 육성`
    },
    timeline: {
      past: {
        year: '21년 이전',
        age: '30세 이전',
        job: ['채용 실무', '채용 브랜딩'],
        role: ['실무자(채용)', '채용 선임']
      },
      nurture: {
        year: '22년 ~ 24년',
        age: '31세 ~ 33세',
        job: ['HRBP 실무', 'HRD 기획', '인사 기획'],
        role: ['HRBP 파트너', '인사 기획 Task', 'HR 전문 과정 / MBA']
      },
      future: {
        year: '26년 ~ 31년',
        age: '35세 ~ 40세',
        job: ['본부 HRBP 총괄', '인사 기획 팀장', '전사 인사기획'],
        role: ['HRBP 팀장', '본부 HRBP 실장', 'CHO 임원']
      }
    },
    milestones: [
      { type: 'edu', label: 'HR 전문과정/MBA', start: '36%', width: '24%', top: '68%' },
      { type: 'project', label: '인사 기획 Task', start: '20%', width: '15%', top: '55%' },
      { type: 'leadership', label: '본부 HRBP 총괄', start: '50%', width: '18%', top: '48%' },
      { type: 'leadership', label: '인사 기획 팀장', start: '70%', width: '18%', top: '52%' }
    ]
  }
}

export default function LgeSlideRoadmapView({ persona }) {
  const personaId = persona.id || 'EMP003'
  const isDemo = ['EMP001', 'EMP002', 'EMP003'].includes(personaId)
  
  // 기본 로드맵 가져오기
  const defaultRoadmap = INITIAL_ROADMAPS[isDemo ? personaId : 'EMP003']

  // 로컬 편집 가능 상태 (localStorage 저장 연동으로 사용자 경험 극대화)
  const [goals, setGoals] = useState({ short: '', medium: '', long: '' })
  const [timeline, setTimeline] = useState({ past: {}, nurture: {}, future: {} })
  
  // 페르소나 변경 시 데이터 초기 로드
  useEffect(() => {
    const saved = localStorage.getItem(`lge_roadmap_${personaId}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setGoals(parsed.goals)
        setTimeline(parsed.timeline)
        return
      } catch (e) {
        console.error('Failed to parse saved roadmap', e)
      }
    }
    
    // 저장된 데이터 없으면 기본 초기값 설정
    setGoals(defaultRoadmap.goals)
    setTimeline(defaultRoadmap.timeline)
  }, [personaId, defaultRoadmap])

  // 값 변경 시 자동 저장
  const handleGoalChange = (key, value) => {
    const updatedGoals = { ...goals, [key]: value }
    setGoals(updatedGoals)
    localStorage.setItem(`lge_roadmap_${personaId}`, JSON.stringify({ goals: updatedGoals, timeline }))
  }

  const handleTimelineChange = (section, key, index, value) => {
    const updatedSection = { ...timeline[section] }
    updatedSection[key][index] = value
    const updatedTimeline = { ...timeline, [section]: updatedSection }
    setTimeline(updatedTimeline)
    localStorage.setItem(`lge_roadmap_${personaId}`, JSON.stringify({ goals, timeline: updatedTimeline }))
  }

  // 초기화 기능
  const handleReset = () => {
    if (window.confirm('원래 템플릿 문구로 초기화하시겠습니까?')) {
      setGoals(defaultRoadmap.goals)
      setTimeline(defaultRoadmap.timeline)
      localStorage.removeItem(`lge_roadmap_${personaId}`)
    }
  }

  // 인쇄/PDF 실행 트리거
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="lge-roadmap-container animate-fade-in-up">
      {/* 액션 컨트롤러 (화면 표시 전용, 인쇄 시 자동 배제) */}
      <div className="lge-roadmap-actions-bar">
        <span className="lge-actions-help-text">
          💡 각 텍스트 박스를 <strong>클릭하시면 바로 편집</strong>할 수 있습니다. 편집 내용은 자동 저장됩니다.
        </span>
        <div className="lge-actions-buttons">
          <button onClick={handleReset} className="btn-reset-roadmap">
            🔄 템플릿 복원
          </button>
          <button onClick={handlePrint} className="btn-print-roadmap">
            🖨️ PDF 다운로드 / 슬라이드 인쇄
          </button>
        </div>
      </div>

      {/* 16:9 슬라이드 본판 (이 영역만 landscape A4로 인쇄됩니다) */}
      <div id="lge-slide-printable" className="lge-ppt-slide">
        {/* 슬라이드 상단 메타 */}
        <div className="lge-slide-header">
          <div className="lge-slide-title">
            {persona.name} {persona.grade} 개인성장 로드맵
          </div>
          <div className="lge-slide-marker">
            LGE Internal Use Only
          </div>
        </div>
        <div className="lge-slide-divider"></div>

        {/* 1. Career Goal 영역 (상단) */}
        <div className="lge-career-goal-board">
          <div className="lge-goal-label-col">
            <div className="vertical-label-text">Career Goal</div>
          </div>
          
          {/* 단기 */}
          <div className="lge-goal-col">
            <div className="lge-goal-col-header">단기(~3년)</div>
            <div className="lge-goal-col-body">
              <textarea
                value={goals.short}
                onChange={(e) => handleGoalChange('short', e.target.value)}
                placeholder="단기 성장 커리어 목표를 입력하세요..."
                className="lge-goal-textarea"
              />
            </div>
          </div>

          {/* 중기 */}
          <div className="lge-goal-col">
            <div className="lge-goal-col-header">중기(4년~6년)</div>
            <div className="lge-goal-col-body">
              <textarea
                value={goals.medium}
                onChange={(e) => handleGoalChange('medium', e.target.value)}
                placeholder="중기 임원 및 핵심 리더 육성 기회를 입력하세요..."
                className="lge-goal-textarea"
              />
            </div>
          </div>

          {/* 장기 */}
          <div className="lge-goal-col">
            <div className="lge-goal-col-header">장기(7년~10년)</div>
            <div className="lge-goal-col-body">
              <textarea
                value={goals.long}
                onChange={(e) => handleGoalChange('long', e.target.value)}
                placeholder="장기 최종 보임 목표와 리더십 비전을 입력하세요..."
                className="lge-goal-textarea"
              />
            </div>
          </div>
        </div>

        {/* 2. 성장 경로 영역 (하단 타임라인) */}
        <div className="lge-career-goal-board lge-career-path-board-wrapper" style={{ marginTop: '20px' }}>
          {/* 좌측 타이틀 */}
          <div className="lge-path-label-col">
            <div className="vertical-label-text">성장 경로</div>
          </div>

          {/* 메트릭스 타임라인 본체 */}
          <div className="lge-path-timeline-matrix">
            {/* 상단 타임라인 헤더 (과거 - 미래사업가 - 장기) */}
            <div className="lge-timeline-header-row">
              {/* 과거 */}
              <div className="lge-timeline-header-cell past-header">
                <div className="timeline-title-main">과거 직무 경험</div>
                <div className="timeline-title-sub">{timeline.past?.year || '21년 이전'} ({timeline.past?.age || '41세 이전'})</div>
              </div>
              
              {/* 미래사업가 육성기간 */}
              <div className="lge-timeline-header-cell nurture-header">
                <div className="timeline-title-main highlight-text">미래사업가 육성기간</div>
                <div className="timeline-title-sub">{timeline.nurture?.year || '22년~24년'} ({timeline.nurture?.age || '42세~44세'})</div>
              </div>

              {/* 장기 육성 방향 */}
              <div className="lge-timeline-header-cell future-header">
                <div className="timeline-title-main">장기 육성 방향</div>
                <div className="timeline-title-sub">{timeline.future?.year || '26년~31년'} ({timeline.future?.age || '46세~51세'})</div>
              </div>
            </div>

            {/* 범례 배지 (레전드) */}
            <div className="lge-slide-legend">
              <span className="legend-badge badge-yellow">호환 가능한 직무/직책</span>
              <span className="legend-badge badge-magenta">육성 Position</span>
            </div>

            {/* 과거/미래 경계 레드 버티컬 라인 */}
            <div className="lge-red-separator-line">
              <div className="red-separator-top-tag">{timeline.past?.year?.replace(' 이전', '') || '21년'} ({timeline.past?.age?.replace(' 이전', '') || '41세'})</div>
            </div>

            {/* 제품·직무 Row */}
            <div className="lge-path-row">
              <div className="lge-path-row-header">제품·직무</div>
              <div className="lge-path-row-cells">
                {/* 과거 */}
                <div className="lge-path-cell-group past-group">
                  {timeline.past?.job?.map((item, idx) => (
                    <input
                      key={`past-job-${idx}`}
                      type="text"
                      value={item}
                      onChange={(e) => handleTimelineChange('past', 'job', idx, e.target.value)}
                      className="lge-path-input"
                    />
                  ))}
                </div>

                {/* 미래 육성 */}
                <div className="lge-path-cell-group nurture-group">
                  {timeline.nurture?.job?.map((item, idx) => (
                    <input
                      key={`nurture-job-${idx}`}
                      type="text"
                      value={item}
                      onChange={(e) => handleTimelineChange('nurture', 'job', idx, e.target.value)}
                      className="lge-path-input input-yellow-box"
                    />
                  ))}
                </div>

                {/* 장기 육성 */}
                <div className="lge-path-cell-group future-group">
                  {timeline.future?.job?.slice(0, 2).map((item, idx) => (
                    <input
                      key={`future-job-${idx}`}
                      type="text"
                      value={item}
                      onChange={(e) => handleTimelineChange('future', 'job', idx, e.target.value)}
                      className="lge-path-input"
                    />
                  ))}
                  {/* 육성 Position (보라색 강조) */}
                  {timeline.future?.job?.[2] && (
                    <input
                      type="text"
                      value={timeline.future.job[2]}
                      onChange={(e) => handleTimelineChange('future', 'job', 2, e.target.value)}
                      className="lge-path-input input-magenta-box font-bold"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 업무·직책 Row */}
            <div className="lge-path-row">
              <div className="lge-path-row-header">업무·직책</div>
              <div className="lge-path-row-cells">
                {/* 과거 */}
                <div className="lge-path-cell-group past-group">
                  {timeline.past?.role?.map((item, idx) => (
                    <input
                      key={`past-role-${idx}`}
                      type="text"
                      value={item}
                      onChange={(e) => handleTimelineChange('past', 'role', idx, e.target.value)}
                      className="lge-path-input"
                    />
                  ))}
                </div>

                {/* 미래 육성 */}
                <div className="lge-path-cell-group nurture-group">
                  {timeline.nurture?.role?.map((item, idx) => (
                    <input
                      key={`nurture-role-${idx}`}
                      type="text"
                      value={item}
                      onChange={(e) => handleTimelineChange('nurture', 'role', idx, e.target.value)}
                      className="lge-path-input"
                    />
                  ))}
                </div>

                {/* 장기 육성 */}
                <div className="lge-path-cell-group future-group grid-cols-2">
                  {timeline.future?.role?.map((item, idx) => (
                    <input
                      key={`future-role-${idx}`}
                      type="text"
                      value={item}
                      onChange={(e) => handleTimelineChange('future', 'role', idx, e.target.value)}
                      className="lge-path-input input-dashed-box text-xs"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 스마트 마일스톤 및 교육 바 (Absolute Positioning 활용한 PPT 스타일 재현) */}
            <div className="lge-milestones-container">
              {defaultRoadmap.milestones.map((ms, idx) => (
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
